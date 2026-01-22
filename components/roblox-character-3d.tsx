'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  RoundedBox,
  Text,
  Trail,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURATION ---
const SCROLL_ANIMATION_END = 400;
const INITIAL_SCALE = 0.55;
const FINAL_SCALE = 0.35;

// --- VERTICAL POSITION CONFIG ---
const INITIAL_Y = -0.8;
const FINAL_Y_DESKTOP = -1.3;
const FINAL_Y_MOBILE = -0.4;

// --- MOBILE SPECIFIC CONFIG ---
const MOBILE_BREAKPOINT = 768;
const MOBILE_SCALE_MULTIPLIER = 0.35;
const MOBILE_Y_OFFSET_ADJUSTMENT = -0.3;

// Easing
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// --- SECTION DATA ---
const SECTION_DATA = [
  {
    message: "Hi! I'm Ready.",
    pose: 'idle',
    face: 'happy',
    link: '',
  },
  {
    message: 'Check this out!',
    pose: 'jump',
    face: 'excited',
    link: '',
  },
  {
    message: 'Can you beat me?',
    pose: 'confident',
    face: 'super-excited',
    link: '',
  },
  {
    message: "Let's connect!",
    pose: 'wave',
    face: 'wink',
    link: 'https://x.com/yourhandle',
  },
  {
    message: 'Hire me now.',
    pose: 'confident',
    face: 'confident',
    link: '',
  },
];

const COLORS = {
  head: '#f5c842',
  torso: '#4a7ebf',
  arms: '#f5c842',
  legs: '#8a9a5b',
  eyes: '#1a1a1a',
  mouth: '#1a1a1a',
};

function RobloxNoobCharacter({
  scrollY,
  currentSection,
  onBubbleClick,
  bubbleMessage,
  characterScale,
  yOffset,
  forceWave = false,
  showBubble = true,
}: {
  scrollY: number;
  currentSection: number;
  onBubbleClick: () => void;
  bubbleMessage: string;
  characterScale: number;
  yOffset: number;
  forceWave?: boolean;
  showBubble?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const auraLightRef = useRef<THREE.PointLight>(null);

  const currentData = SECTION_DATA[currentSection % SECTION_DATA.length];
  const pose = forceWave ? 'wave' : currentData.pose;
  const face = forceWave ? 'happy' : currentData.face;
  const [, setIsHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Mouse Tracking
    const targetRotX = Math.max(-0.3, Math.min(0.3, -mouse.y * 0.5));
    const targetRotY = Math.max(-0.6, Math.min(0.6, mouse.x * 0.8));
    const floatRot = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

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

    // Face Morphing
    let tLeftEye = { scale: [1, 1, 1] };
    let tRightEye = { scale: [1, 1, 1] };
    let tMouth = { scale: [1, 1, 1], rotZ: 0, rotX: 0 };
    let tBrows = { y: 1.8, rotZ: 0 };

    if (face === 'wink') {
      tLeftEye = { scale: [1, 0.1, 1] };
    } else if (face === 'excited' || face === 'super-excited') {
      tLeftEye = { scale: [1.2, 1.2, 1] };
      tRightEye = { scale: [1.2, 1.2, 1] };
      tMouth = { scale: [1.3, 1.3, 1], rotZ: 0, rotX: 0.2 };
      tBrows = { y: 1.9, rotZ: 0.2 };
    } else if (face === 'confident') {
      tMouth = { scale: [0.8, 0.8, 1], rotZ: -0.2, rotX: 0 };
      tBrows = { y: 1.75, rotZ: -0.15 };
    }

    if (leftEyeRef.current)
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        tLeftEye.scale[1],
        delta * 12,
      );
    if (rightEyeRef.current)
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
        rightEyeRef.current.scale.y,
        tRightEye.scale[1],
        delta * 12,
      );
    if (mouthRef.current) {
      mouthRef.current.rotation.z = THREE.MathUtils.lerp(
        mouthRef.current.rotation.z,
        tMouth.rotZ,
        delta * 12,
      );
      mouthRef.current.rotation.x = THREE.MathUtils.lerp(
        mouthRef.current.rotation.x,
        tMouth.rotX,
        delta * 12,
      );
      mouthRef.current.scale.setScalar(
        THREE.MathUtils.lerp(
          mouthRef.current.scale.x,
          tMouth.scale[0],
          delta * 12,
        ),
      );
    }
    if (leftBrowRef.current && rightBrowRef.current) {
      leftBrowRef.current.position.y = THREE.MathUtils.lerp(
        leftBrowRef.current.position.y,
        tBrows.y,
        delta * 10,
      );
      leftBrowRef.current.rotation.z = THREE.MathUtils.lerp(
        leftBrowRef.current.rotation.z,
        tBrows.rotZ,
        delta * 10,
      );
      rightBrowRef.current.position.y = THREE.MathUtils.lerp(
        rightBrowRef.current.position.y,
        tBrows.y,
        delta * 10,
      );
      rightBrowRef.current.rotation.z = THREE.MathUtils.lerp(
        rightBrowRef.current.rotation.z,
        -tBrows.rotZ,
        delta * 10,
      );
    }

    // Arm Poses
    let tLeftArm = -0.1;
    let tRightArm = 0.1;
    let tBodyTilt = 0;
    let tBounce = 0;

    if (pose === 'wave') {
      tRightArm = Math.PI * 0.85;
      tBodyTilt = -0.05;
    } else if (pose === 'jump') {
      tLeftArm = -Math.PI * 0.8;
      tRightArm = Math.PI * 0.8;
      tBounce = Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.2;
    } else if (pose === 'excited') {
      tLeftArm = -Math.PI * 0.3;
      tRightArm = Math.PI * 0.3;
    }

    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
        leftShoulderRef.current.rotation.z,
        tLeftArm,
        delta * 8,
      );
      leftShoulderRef.current.rotation.x = -0.15;
    }
    if (rightShoulderRef.current) {
      const wave =
        pose === 'wave' ? Math.sin(state.clock.elapsedTime * 12) * 0.4 : 0;
      rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
        rightShoulderRef.current.rotation.z,
        tRightArm + wave,
        delta * 8,
      );
      rightShoulderRef.current.rotation.x = -0.15;
    }

    // Hover Physics
    const hoverAmplitude = 0.15;
    const hoverSpeed = 1.5;
    const constantFloat =
      Math.sin(state.clock.elapsedTime * hoverSpeed) * hoverAmplitude;
    const targetY = yOffset + constantFloat + tBounce;

    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      delta * 10,
    );
    const hoverTilt = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      tBodyTilt + hoverTilt,
      delta * 3,
    );

    if (auraLightRef.current) {
      const targetIntensity =
        face === 'confident'
          ? 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
          : 0;
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
        {(face === 'excited' ||
          face === 'super-excited' ||
          face === 'wink') && (
          <Sparkles
            count={15}
            scale={2}
            size={4}
            speed={0.4}
            opacity={1}
            color="#FFF"
            position={[0, 1.8, 0]}
          />
        )}

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

        <RoundedBox
          args={[1.1, 1.1, 1.1]}
          radius={0.15}
          smoothness={4}
          position={[0, 1.55, 0]}
        >
          <meshStandardMaterial color={COLORS.head} />
        </RoundedBox>
        <mesh ref={leftEyeRef} position={[-0.22, 1.65, 0.56]}>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.22, 1.65, 0.56]}>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>
        <mesh ref={leftBrowRef} position={[-0.22, 1.8, 0.55]}>
          <boxGeometry args={[0.18, 0.04, 0.02]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>
        <mesh ref={rightBrowRef} position={[0.22, 1.8, 0.55]}>
          <boxGeometry args={[0.18, 0.04, 0.02]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>
        <group ref={mouthRef} position={[0, 1.45, 0.58]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.12, 0.03, 12, 32, Math.PI]} />
            <meshStandardMaterial color={COLORS.mouth} />
          </mesh>
        </group>
        <RoundedBox
          args={[1.3, 1.2, 0.65]}
          radius={0.08}
          smoothness={4}
          position={[0, 0.4, 0]}
        >
          <meshStandardMaterial color={COLORS.torso} />
        </RoundedBox>
        <group ref={leftShoulderRef} position={[-0.85, 0.9, 0]}>
          <mesh position={[0, -0.55, 0]}>
            <RoundedBox args={[0.4, 1.1, 0.45]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color={COLORS.arms} />
            </RoundedBox>
            {pose === 'jump' && (
              <group position={[0, -0.5, 0]}>
                <Trail
                  width={0.8}
                  length={3}
                  color="#FFF"
                  attenuation={(t) => t * t}
                />
              </group>
            )}
          </mesh>
        </group>
        <group ref={rightShoulderRef} position={[0.85, 0.9, 0]}>
          <mesh position={[0, -0.55, 0]}>
            <RoundedBox args={[0.4, 1.1, 0.45]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color={COLORS.arms} />
            </RoundedBox>
            {(pose === 'wave' || pose === 'jump') && (
              <group position={[0, -0.5, 0]}>
                <Trail
                  width={0.8}
                  length={3}
                  color="#FFF"
                  attenuation={(t) => t * t}
                />
              </group>
            )}
          </mesh>
        </group>
        <RoundedBox
          args={[0.5, 1.1, 0.5]}
          radius={0.06}
          smoothness={4}
          position={[-0.32, -0.75, 0]}
        >
          <meshStandardMaterial color={COLORS.legs} />
        </RoundedBox>
        <RoundedBox
          args={[0.5, 1.1, 0.5]}
          radius={0.06}
          smoothness={4}
          position={[0.32, -0.75, 0]}
        >
          <meshStandardMaterial color={COLORS.legs} />
        </RoundedBox>
      </group>
    </group>
  );
}

export function RobloxCharacter3D({
  activeSection = 0,
}: {
  activeSection?: number;
}) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

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

  // --- X POSITION LOGIC (UPDATED FOR LEFT SIDE) ---

  // 1. Container Position (CSS left)
  // Hero (Start): 50%
  // Scrolled (End): 5% (Moves to the left edge)
  const targetLeft = isMobile ? -10 : 5;
  const leftPercent = 50 + (targetLeft - 50) * easedProgress;

  // 2. Character Position (CSS transform)
  // Hero (Start): -50% (Standard centering relative to left: 50%)
  // Scrolled (End): -25% (Shifts character slightly left within container)
  const targetTranslateX = isMobile ? 0 : -25;
  // We interpolate from -50 to targetTranslateX
  const translateXPercent = -50 + (targetTranslateX - -50) * easedProgress;

  const isInHeroSection = scrollY < 100;

  const sectionData = SECTION_DATA[activeSection % SECTION_DATA.length];
  const handleBubbleClick = () => window.open(sectionData.link, '_blank');

  return (
    <div
      className={`fixed bottom-0 z-[100] pointer-events-none overflow-visible touch-none
        ${isMobile ? 'w-[250px]' : 'w-[450px]'}
      `}
      style={{
        // UPDATED: Using 'left' instead of 'right'
        left: `${leftPercent}%`,
        transform: `translateX(${translateXPercent}%)`,
        height: '100vh',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 40 }}
        style={{ background: 'transparent', pointerEvents: 'auto' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-3, 2, 3]} color="#8b5cf6" intensity={0.4} />

          <RobloxNoobCharacter
            scrollY={scrollY}
            currentSection={activeSection}
            onBubbleClick={handleBubbleClick}
            bubbleMessage={
              isInHeroSection ? "Hi! I'm Ready." : sectionData.message
            }
            characterScale={calculatedScale}
            yOffset={calculatedYOffset}
            forceWave={isInHeroSection}
            showBubble={!isInHeroSection}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
