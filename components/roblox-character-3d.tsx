'use client';

import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. CONFIGURATION ---
const SECTION_DATA = [
  {
    message: 'Hey there! Welcome!',
    pose: 'idle',
    face: 'happy',
    link: 'https://discord.gg/yourserver',
  },
  {
    message: 'Check my projects!',
    pose: 'jump',
    face: 'excited',
    link: 'https://discord.gg/yourserver',
  },
  {
    message: 'Follow me for more!',
    pose: 'wave',
    face: 'wink',
    link: 'https://x.com/yourhandle',
  },
  {
    message: "Let's build cool stuff!",
    pose: 'excited',
    face: 'super-excited',
    link: 'https://discord.gg/yourserver',
  },
  {
    message: "Hiring? Let's chat!",
    pose: 'confident',
    face: 'confident',
    link: 'https://discord.gg/yourserver',
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

interface CharacterProps {
  scrollY: number;
  currentSection: number;
  onBubbleClick: () => void;
  bubbleMessage: string;
}

function RobloxNoobCharacter({
  scrollY,
  currentSection,
  onBubbleClick,
  bubbleMessage,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const currentData = SECTION_DATA[currentSection % SECTION_DATA.length];
  const currentPose = currentData.pose;
  const currentFace = currentData.face;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setTargetRotation({ x: y * 0.15, y: x * 0.3 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- 2. FIXED POSES (DIRECTIONS FLIPPED) ---
  const poseConfig = useMemo(() => {
    // Math Logic:
    // Left Arm: (-) rotates OUT to the left.
    // Right Arm: (+) rotates OUT to the right.

    const poses: Record<
      string,
      {
        leftArm: number;
        rightArm: number;
        bodyTilt: number;
        jumpHeight?: number;
      }
    > = {
      idle: {
        leftArm: -0.1, // Slight out to left
        rightArm: 0.1, // Slight out to right
        bodyTilt: 0,
      },
      wave: {
        leftArm: -0.1,
        rightArm: Math.PI * 0.85, // POSITIVE = Way up/out to the Right
        bodyTilt: -0.05,
      },
      jump: {
        leftArm: -Math.PI * 0.8, // NEGATIVE = Up/Out Left
        rightArm: Math.PI * 0.8, // POSITIVE = Up/Out Right
        bodyTilt: 0,
        jumpHeight: 0.2,
      },
      excited: {
        leftArm: -Math.PI * 0.3, // Out Left
        rightArm: Math.PI * 0.3, // Out Right
        bodyTilt: 0,
      },
      confident: {
        leftArm: 0,
        rightArm: 0.1,
        bodyTilt: 0,
      },
    };
    return poses[currentPose] || poses.idle;
  }, [currentPose]);

  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.y,
        delta * 3,
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        poseConfig.bodyTilt,
        delta * 2,
      );

      const scrollOffset = scrollY * 0.001;
      let yPos =
        -scrollOffset * 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;

      if (poseConfig.jumpHeight) {
        yPos += Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.3;
      }

      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        yPos,
        delta * 3,
      );
    }

    // --- ANIMATE ARMS ---
    if (leftShoulderRef.current) {
      // Left Arm Animation
      // We use NEGATIVE values to go OUT
      const breath = -Math.abs(Math.sin(state.clock.elapsedTime * 2) * 0.05);

      leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
        leftShoulderRef.current.rotation.z,
        poseConfig.leftArm + breath,
        delta * 4,
      );

      // Slight forward tilt to prevent clipping
      leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
        leftShoulderRef.current.rotation.x,
        -0.1,
        delta * 4,
      );
    }

    if (rightShoulderRef.current) {
      // Right Arm Animation
      // We use POSITIVE values to go OUT
      // For wave: Big sine wave. For idle: Small breath.
      const waveOffset =
        currentPose === 'wave'
          ? Math.sin(state.clock.elapsedTime * 8) * 0.3
          : Math.abs(Math.sin(state.clock.elapsedTime * 2) * 0.05);

      rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
        rightShoulderRef.current.rotation.z,
        poseConfig.rightArm + waveOffset,
        delta * 4,
      );

      rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
        rightShoulderRef.current.rotation.x,
        -0.1,
        delta * 4,
      );
    }
  });

  const characterScale = viewport.width > 6 ? 0.55 : 0.4;

  return (
    <Float speed={1} rotationIntensity={0.02} floatIntensity={0.15}>
      <group ref={groupRef} scale={characterScale} position={[0, 0.2, 0]}>
        {/* --- CHAT BUBBLE --- */}
        <group position={[0, 2.6, 0.5]}>
          <mesh position={[0, 0, -0.1]}>
            <RoundedBox args={[2.6, 0.9, 0.1]} radius={0.15} smoothness={4}>
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.95}
              />
            </RoundedBox>
          </mesh>
          <mesh position={[0, 0, -0.15]}>
            <RoundedBox args={[2.7, 1.0, 0.08]} radius={0.18} smoothness={4}>
              <meshStandardMaterial
                color="#8b5cf6"
                transparent
                opacity={0.6}
                emissive="#8b5cf6"
                emissiveIntensity={0.3}
              />
            </RoundedBox>
          </mesh>
          <mesh position={[0, -0.55, -0.1]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.15, 0.3, 3]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        <group position={[0, 2.6, 0.6]}>
          <mesh
            onClick={onBubbleClick}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
            <planeGeometry args={[2.6, 0.9]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>

        {/* --- TEXT --- */}
        <Text
          position={[0, 2.6, 0.56]}
          fontSize={0.2}
          color={isHovered ? '#8b5cf6' : '#1a1a2e'}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.3}
          textAlign="center"
          lineHeight={1.4}
          // Uncomment for pixel font
          // font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff"
        >
          {bubbleMessage}
        </Text>

        {/* --- CHARACTER --- */}
        <RoundedBox
          args={[1.1, 1.1, 1.1]}
          radius={0.15}
          smoothness={4}
          position={[0, 1.55, 0]}
        >
          <meshStandardMaterial color={COLORS.head} />
        </RoundedBox>

        {/* Faces */}
        {currentFace === 'wink' ? (
          <>
            <mesh position={[-0.2, 1.65, 0.56]}>
              <boxGeometry args={[0.16, 0.04, 0.02]} />
              <meshStandardMaterial color={COLORS.eyes} />
            </mesh>
            <mesh position={[0.2, 1.65, 0.56]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={COLORS.eyes} />
            </mesh>
          </>
        ) : currentFace === 'super-excited' ? (
          <>
            <mesh position={[-0.2, 1.65, 0.56]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color={COLORS.eyes} />
            </mesh>
            <mesh position={[0.2, 1.65, 0.56]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color={COLORS.eyes} />
            </mesh>
            <mesh position={[-0.2, 1.65, 0.58]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.2, 1.65, 0.58]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[-0.2, 1.65, 0.56]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={COLORS.eyes} />
            </mesh>
            <mesh position={[0.2, 1.65, 0.56]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={COLORS.eyes} />
            </mesh>
          </>
        )}

        {/* Mouth */}
        {currentFace === 'super-excited' ? (
          <group position={[0, 1.38, 0.56]}>
            <mesh position={[-0.1, 0, 0]} rotation={[0, 0, -0.4]}>
              <boxGeometry args={[0.14, 0.06, 0.02]} />
              <meshStandardMaterial color={COLORS.mouth} />
            </mesh>
            <mesh position={[0.1, 0, 0]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[0.14, 0.06, 0.02]} />
              <meshStandardMaterial color={COLORS.mouth} />
            </mesh>
          </group>
        ) : currentFace === 'confident' ? (
          <group position={[0, 1.4, 0.56]}>
            <mesh position={[-0.05, 0, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.1, 0.05, 0.02]} />
              <meshStandardMaterial color={COLORS.mouth} />
            </mesh>
            <mesh position={[0.08, 0.02, 0]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[0.12, 0.05, 0.02]} />
              <meshStandardMaterial color={COLORS.mouth} />
            </mesh>
          </group>
        ) : (
          <group position={[0, 1.4, 0.56]}>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.12, 0.05, 0.02]} />
              <meshStandardMaterial color={COLORS.mouth} />
            </mesh>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.12, 0.05, 0.02]} />
              <meshStandardMaterial color={COLORS.mouth} />
            </mesh>
          </group>
        )}

        {/* Torso */}
        <RoundedBox
          args={[1.3, 1.2, 0.65]}
          radius={0.08}
          smoothness={4}
          position={[0, 0.4, 0]}
        >
          <meshStandardMaterial color={COLORS.torso} />
        </RoundedBox>

        {/* --- ARMS (Shoulder Pivots) --- */}
        <group ref={leftShoulderRef} position={[-0.9, 0.9, 0]}>
          <mesh position={[0, -0.55, 0]}>
            <RoundedBox args={[0.4, 1.1, 0.45]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color={COLORS.arms} />
            </RoundedBox>
          </mesh>
        </group>

        <group ref={rightShoulderRef} position={[0.9, 0.9, 0]}>
          <mesh position={[0, -0.55, 0]}>
            <RoundedBox args={[0.4, 1.1, 0.45]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color={COLORS.arms} />
            </RoundedBox>
          </mesh>
        </group>

        {/* Legs */}
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
    </Float>
  );
}

function FloatingParticles({ scrollY }: { scrollY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.position.y = -scrollY * 0.0005;
    }
  });
  return (
    <group ref={groupRef}>
      {[...Array(6)].map((_, i) => (
        <Float
          key={i}
          speed={1.5 + i * 0.2}
          rotationIntensity={0.3}
          floatIntensity={0.8}
        >
          <mesh
            position={[
              Math.sin(i * 1.2) * 3,
              Math.cos(i * 0.8) * 1.5,
              Math.sin(i * 0.5) * 2 - 1,
            ]}
          >
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial
              color={
                [
                  '#8b5cf6',
                  '#ec4899',
                  '#3b82f6',
                  '#06b6d4',
                  '#f472b6',
                  '#a855f7',
                ][i]
              }
              emissive={
                [
                  '#8b5cf6',
                  '#ec4899',
                  '#3b82f6',
                  '#06b6d4',
                  '#f472b6',
                  '#a855f7',
                ][i]
              }
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export function RobloxCharacter3D() {
  const [scrollY, setScrollY] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const sectionHeight = window.innerHeight * 0.8;
      const newSection = Math.floor(window.scrollY / sectionHeight);
      setCurrentSection(newSection);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionData = SECTION_DATA[currentSection % SECTION_DATA.length];
  const handleBubbleClick = () => window.open(sectionData.link, '_blank');

  return (
    <div className="fixed right-0 top-0 w-[280px] md:w-[350px] lg:w-[420px] h-screen pointer-events-none z-30">
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 45 }}
        style={{ background: 'transparent', pointerEvents: 'auto' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-3, 3, 3]} intensity={0.4} color="#8b5cf6" />
          <pointLight position={[3, -2, 2]} intensity={0.3} color="#ec4899" />

          <RobloxNoobCharacter
            scrollY={scrollY}
            currentSection={currentSection}
            onBubbleClick={handleBubbleClick}
            bubbleMessage={sectionData.message}
          />
          <FloatingParticles scrollY={scrollY} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
