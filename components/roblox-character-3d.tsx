'use client';

import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  RoundedBox,
  Text,
  Sparkles,
  useGLTF,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { buildRig, normalizeRig } from '@/components/avatar-rig';

// --- CONFIGURATION ---
const SCROLL_ANIMATION_END = 400;
const INITIAL_SCALE = 0.55;
const FINAL_SCALE = 0.35;

// --- VERTICAL POSITION CONFIG ---
const INITIAL_Y = -1.0;
const FINAL_Y_DESKTOP = -1.3;
const FINAL_Y_MOBILE = -0.4;

// --- MOBILE SPECIFIC CONFIG ---
const MOBILE_BREAKPOINT = 768;
const MOBILE_SCALE_MULTIPLIER = 0.45;
const MOBILE_Y_OFFSET_ADJUSTMENT = -0.3;

// --- MODEL NORMALIZATION ---
// Normalized so the avatar matches the old procedural character's extents:
// feet at y=-1.3, total height 3.4 units.
const MODEL_HEIGHT = 3.4;
const MODEL_FOOT_Y = -1.3;
// Flip if the exported model faces away from the camera.
const MODEL_FACING_Y = Math.PI;

const AVATAR_URL = '/avatar.glb';

// Easing Function
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// --- SECTION DATA ---
const SECTION_DATA = [
  { message: "Hi! I'm Sabbz.", pose: 'idle', link: '' },
  { message: 'Check this out!', pose: 'jump', link: '' },
  { message: 'Can you beat me?', pose: 'confident', link: '' },
  { message: "Let's connect!", pose: 'wave', link: 'https://x.com/sabbz2z' },
  { message: 'Hire me now.', pose: 'confident', link: '' },
];

// --- INNER CHARACTER COMPONENT ---
function SabbzAvatar({
  currentSection,
  onBubbleClick,
  bubbleMessage,
  characterScale,
  yOffset,
  forceWave = false,
  showBubble = true,
}: {
  currentSection: number;
  onBubbleClick: () => void;
  bubbleMessage: string;
  characterScale: number;
  yOffset: number;
  forceWave?: boolean;
  showBubble?: boolean;
}) {
  const { scene } = useGLTF(AVATAR_URL);
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  const auraLightRef = useRef<THREE.PointLight>(null);
  const [, setIsHovered] = useState(false);

  const rig = useMemo(() => {
    const built = buildRig(scene);
    const wrapper = normalizeRig(built, {
      height: MODEL_HEIGHT,
      footY: MODEL_FOOT_Y,
      facingY: MODEL_FACING_Y,
    });
    return { ...built, wrapper };
  }, [scene]);

  const currentData = SECTION_DATA[currentSection % SECTION_DATA.length];
  const pose = forceWave ? 'wave' : currentData.pose;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // 1. Mouse Tracking (whole body)
    const targetRotX = Math.max(-0.25, Math.min(0.25, -mouse.y * 0.4));
    const targetRotY = Math.max(-0.6, Math.min(0.6, mouse.x * 0.8));
    const floatRot = Math.sin(t * 0.5) * 0.05;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX + floatRot,
      delta * 5,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      delta * 5,
    );

    // 2. Head tracking (extra mouse-follow on top of body)
    if (rig.headPivot) {
      const headRotY = Math.max(-0.5, Math.min(0.5, mouse.x * 0.5));
      const headRotX = Math.max(-0.3, Math.min(0.3, -mouse.y * 0.35));
      let headTilt = 0;
      if (pose === 'confident') headTilt = -0.12;

      rig.headPivot.rotation.y = THREE.MathUtils.lerp(
        rig.headPivot.rotation.y,
        headRotY,
        delta * 6,
      );
      rig.headPivot.rotation.x = THREE.MathUtils.lerp(
        rig.headPivot.rotation.x,
        headRotX + (pose === 'jump' ? -0.15 : 0),
        delta * 6,
      );
      rig.headPivot.rotation.z = THREE.MathUtils.lerp(
        rig.headPivot.rotation.z,
        headTilt,
        delta * 4,
      );
    }

    // 3. Arm Poses
    let tLeftArm = -0.08;
    let tRightArm = 0.08;
    let tBodyTilt = 0;
    let tBounce = 0;

    if (pose === 'wave') {
      tRightArm = Math.PI * 0.85;
      tBodyTilt = -0.05;
    } else if (pose === 'jump') {
      tLeftArm = -Math.PI * 0.8;
      tRightArm = Math.PI * 0.8;
      tBounce = Math.abs(Math.sin(t * 8)) * 0.2;
    } else if (pose === 'confident') {
      tLeftArm = -0.25;
      tRightArm = 0.25;
    }

    // Idle micro-sway so arms never look frozen
    const idleSway = Math.sin(t * 1.8) * 0.04;

    if (rig.leftShoulder) {
      rig.leftShoulder.rotation.z = THREE.MathUtils.lerp(
        rig.leftShoulder.rotation.z,
        -(tLeftArm + idleSway),
        delta * 8,
      );
      rig.leftShoulder.rotation.x = THREE.MathUtils.lerp(
        rig.leftShoulder.rotation.x,
        -0.08,
        delta * 8,
      );
    }
    if (rig.rightShoulder) {
      const wave = pose === 'wave' ? Math.sin(t * 12) * 0.4 : 0;
      rig.rightShoulder.rotation.z = THREE.MathUtils.lerp(
        rig.rightShoulder.rotation.z,
        -(tRightArm + wave + idleSway),
        delta * 8,
      );
      rig.rightShoulder.rotation.x = THREE.MathUtils.lerp(
        rig.rightShoulder.rotation.x,
        -0.08,
        delta * 8,
      );
    }

    // 4. Hover Physics
    const constantFloat = Math.sin(t * 1.5) * 0.15;
    const targetY = yOffset + constantFloat + tBounce;

    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      delta * 10,
    );
    const hoverTilt = Math.sin(t * 0.8) * 0.05;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      tBodyTilt + hoverTilt,
      delta * 3,
    );

    // 5. Aura Light
    if (auraLightRef.current) {
      const targetIntensity =
        pose === 'confident' ? 0.8 + Math.sin(t * 3) * 0.2 : 0;
      auraLightRef.current.intensity = THREE.MathUtils.lerp(
        auraLightRef.current.intensity,
        targetIntensity,
        delta * 5,
      );
    }
  });

  return (
    <group scale={characterScale} position={[0, 0, 0]}>
      <Sparkles
        count={30}
        scale={5}
        size={2}
        speed={0.4}
        opacity={0.4}
        color="#badaff"
        position={[0, 1, 0]}
      />
      <pointLight
        ref={auraLightRef}
        position={[0, 1.5, -1]}
        color="#8b5cf6"
        distance={5}
        intensity={0}
      />

      <group ref={groupRef}>
        {showBubble && (
          <group position={[0, 3.0, 0.5]}>
            <RoundedBox args={[2.8, 0.8, 0.1]} radius={0.1}>
              <meshStandardMaterial color="white" transparent opacity={0.95} />
            </RoundedBox>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.2}
              color="#1a1a2e"
              anchorX="center"
              anchorY="middle"
              maxWidth={2.6}
              textAlign="center"
            >
              {bubbleMessage}
            </Text>
            <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.15, 0.3, 3]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh
              onClick={onBubbleClick}
              onPointerOver={() => setIsHovered(true)}
              onPointerOut={() => setIsHovered(false)}
              visible={false}
            >
              <planeGeometry args={[2.8, 0.8]} />
            </mesh>
          </group>
        )}

        <primitive object={rig.wrapper} />
      </group>
    </group>
  );
}

useGLTF.preload(AVATAR_URL);

// --- MAIN EXPORTED COMPONENT ---
export function RobloxCharacter3D({
  activeSection = 0,
}: {
  activeSection?: number;
}) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollProgress = Math.min(
    1,
    Math.max(0, scrollY / SCROLL_ANIMATION_END),
  );
  const easedProgress = easeOutCubic(scrollProgress);

  // --- SCALE LOGIC ---
  let calculatedScale =
    INITIAL_SCALE + (FINAL_SCALE - INITIAL_SCALE) * easedProgress;
  if (isMobile) {
    calculatedScale *= MOBILE_SCALE_MULTIPLIER;
  }

  // --- Y POSITION LOGIC ---
  const targetY = isMobile ? FINAL_Y_MOBILE : FINAL_Y_DESKTOP;
  let calculatedYOffset = INITIAL_Y + (targetY - INITIAL_Y) * easedProgress;
  if (isMobile) {
    calculatedYOffset += MOBILE_Y_OFFSET_ADJUSTMENT;
  }

  // --- HORIZONTAL (X) POSITION LOGIC ---
  const startLeft = isMobile ? 50 : 75;
  const endLeft = isMobile ? 25 : 10;

  const leftPercent = startLeft + (endLeft - startLeft) * easedProgress;
  const isInHeroSection = scrollY < 100;
  const sectionData = SECTION_DATA[activeSection % SECTION_DATA.length];

  const handleBubbleClick = () => {
    if (sectionData.link) window.open(sectionData.link, '_blank');
  };

  return (
    <div
      className={`fixed bottom-0 z-[100] pointer-events-none overflow-visible touch-none transition-width duration-300
        ${isMobile ? 'w-[250px]' : 'w-[500px]'}
      `}
      style={{
        left: `${leftPercent}%`,
        transform: `translateX(-50%)`,
        height: '100vh',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 40 }}
        dpr={[1, 2]}
        style={{ background: 'transparent', pointerEvents: 'auto' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-3, 2, 3]} color="#8b5cf6" intensity={0.4} />
          {/* Rim light to separate the avatar from the page background */}
          <pointLight position={[0, 2, -3]} color="#ec4899" intensity={1.5} />

          <SabbzAvatar
            currentSection={activeSection}
            onBubbleClick={handleBubbleClick}
            bubbleMessage={
              isInHeroSection ? "Hi! I'm Sabbz." : sectionData.message
            }
            characterScale={calculatedScale}
            yOffset={calculatedYOffset}
            forceWave={isInHeroSection}
            showBubble={!isInHeroSection}
          />
          <ContactShadows
            position={[0, -1.65, 0]}
            opacity={0.45}
            scale={5}
            blur={2.6}
            far={3}
            color="#1e1033"
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
