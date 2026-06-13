'use client';

import { useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WALL = '#16131a';
const WALL_DARK = '#100d14';
const FLOOR = '#0c0a10';
const RED = '#ff2438';

function Panel({
  position,
  rotation,
  size,
  color = WALL,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.25} />
    </mesh>
  );
}

function RedStrip({
  position,
  size,
  intensity = 2,
}: {
  position: [number, number, number];
  size: [number, number, number];
  intensity?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={RED}
        emissive={RED}
        emissiveIntensity={intensity}
        roughness={0.4}
      />
    </mesh>
  );
}

/** Sliding door that opens when the avatar gets close (scroll-scrub safe). */
function Door({
  z,
  avatarRef,
  width = 2.4,
  height = 3.2,
}: {
  z: number;
  avatarRef: MutableRefObject<THREE.Group | null>;
  width?: number;
  height?: number;
}) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const lampRef = useRef<THREE.MeshStandardMaterial>(null);
  const openRef = useRef(0);

  useFrame((_, delta) => {
    const av = avatarRef.current;
    if (!av) return;
    const dist = Math.abs(av.position.z - z);
    const target = dist < 4.5 ? 1 : 0;
    openRef.current += (target - openRef.current) * Math.min(1, delta * 3.5);
    const o = openRef.current;

    const slide = (width / 2) * 0.96 * o;
    if (leftRef.current) leftRef.current.position.x = -width / 4 - slide;
    if (rightRef.current) rightRef.current.position.x = width / 4 + slide;
    if (lampRef.current) {
      // Red when locked → warm white when open
      lampRef.current.emissive.set(o > 0.6 ? '#ffe9d6' : RED);
      lampRef.current.emissiveIntensity = 1.5 + Math.sin(o * Math.PI) * 1.0;
    }
  });

  const panelW = width / 2;
  return (
    <group position={[0, 0, z]}>
      <mesh ref={leftRef} position={[-width / 4, height / 2, 0]}>
        <boxGeometry args={[panelW, height, 0.14]} />
        <meshStandardMaterial color="#241d28" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh ref={rightRef} position={[width / 4, height / 2, 0]}>
        <boxGeometry args={[panelW, height, 0.14]} />
        <meshStandardMaterial color="#241d28" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, height + 0.12, 0]}>
        <boxGeometry args={[width + 0.5, 0.25, 0.3]} />
        <meshStandardMaterial color={WALL_DARK} roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Status lamp */}
      <mesh position={[0, height + 0.12, 0.18]}>
        <boxGeometry args={[0.5, 0.1, 0.05]} />
        <meshStandardMaterial
          ref={lampRef}
          color="#1a1a1a"
          emissive={RED}
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

/** Structural rib framing the corridor cross-section. */
function Rib({
  z,
  halfWidth = 3,
  height = 4,
}: {
  z: number;
  halfWidth?: number;
  height?: number;
}) {
  const mat = (
    <meshStandardMaterial color="#1d1822" roughness={0.55} metalness={0.55} />
  );
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-halfWidth + 0.08, height / 2, 0]}>
        <boxGeometry args={[0.16, height, 0.24]} />
        {mat}
      </mesh>
      <mesh position={[halfWidth - 0.08, height / 2, 0]}>
        <boxGeometry args={[0.16, height, 0.24]} />
        {mat}
      </mesh>
      <mesh position={[0, height - 0.08, 0]}>
        <boxGeometry args={[halfWidth * 2, 0.16, 0.24]} />
        {mat}
      </mesh>
    </group>
  );
}

/** Pipes running along the corridor ceiling, with junction collars. */
function CeilingPipes({
  zFrom,
  zTo,
  x = -2.5,
}: {
  zFrom: number;
  zTo: number;
  x?: number;
}) {
  const len = Math.abs(zTo - zFrom);
  const zc = (zFrom + zTo) / 2;
  const collars = [];
  for (let z = Math.max(zFrom, zTo) - 2; z > Math.min(zFrom, zTo) + 1; z -= 4) {
    collars.push(z);
  }
  return (
    <group>
      <mesh position={[x, 3.76, zc]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, len, 8]} />
        <meshStandardMaterial color="#241d28" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[x + 0.24, 3.82, zc]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, len, 8]} />
        <meshStandardMaterial color="#33202a" roughness={0.4} metalness={0.7} />
      </mesh>
      {collars.map((z) => (
        <mesh key={z} position={[x, 3.76, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.1, 8]} />
          <meshStandardMaterial
            color="#16121c"
            roughness={0.5}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Floor warning strip in front of a door. */
function HazardStrip({ z }: { z: number }) {
  return (
    <mesh position={[0, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.8, 0.5]} />
      <meshStandardMaterial
        color="#2c0c12"
        emissive={RED}
        emissiveIntensity={0.35}
        roughness={0.8}
      />
    </mesh>
  );
}

function Crate({
  position,
  size = 0.85,
  rotation = 0,
}: {
  position: [number, number, number];
  size?: number;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, size / 2, 0]}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#1a141f" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.94, 0]}>
        <boxGeometry args={[size * 1.03, size * 0.05, size * 1.03]} />
        <meshStandardMaterial
          color="#2a1016"
          emissive={RED}
          emissiveIntensity={0.45}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

/** Work console with a glowing slanted screen. */
function Console({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.5, 0.9, 0.55]} />
        <meshStandardMaterial color="#16121c" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.02, 0.02]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[1.3, 0.55, 0.06]} />
        <meshStandardMaterial
          color="#0b070d"
          emissive="#ff3040"
          emissiveIntensity={0.8}
          roughness={0.3}
        />
      </mesh>
      <pointLight
        position={[0, 1.3, 0.6]}
        color="#ff3040"
        intensity={1.2}
        distance={3}
      />
    </group>
  );
}

/** Wall with a centered doorway gap, facing +z (toward the visitor). */
function DoorwayWall({
  z,
  halfWidth,
  gap = 1.2,
  gapHeight = 3.2,
  height = 4,
}: {
  z: number;
  halfWidth: number;
  gap?: number;
  gapHeight?: number;
  height?: number;
}) {
  const panelW = halfWidth - gap;
  const cx = gap + panelW / 2;
  return (
    <group>
      <Panel position={[-cx, height / 2, z]} rotation={[0, 0, 0]} size={[panelW, height]} />
      <Panel position={[cx, height / 2, z]} rotation={[0, 0, 0]} size={[panelW, height]} />
      <Panel
        position={[0, gapHeight + (height - gapHeight) / 2, z]}
        rotation={[0, 0, 0]}
        size={[gap * 2, height - gapHeight]}
      />
    </group>
  );
}

function Corridor({
  zFrom,
  zTo,
  halfWidth = 3,
  height = 4,
}: {
  zFrom: number;
  zTo: number;
  halfWidth?: number;
  height?: number;
}) {
  const len = Math.abs(zTo - zFrom);
  const zc = (zFrom + zTo) / 2;
  const strips = [];
  for (let z = Math.max(zFrom, zTo) - 1.5; z > Math.min(zFrom, zTo) + 0.5; z -= 3.5) {
    strips.push(z);
  }
  return (
    <group>
      <Panel position={[-halfWidth, height / 2, zc]} rotation={[0, Math.PI / 2, 0]} size={[len, height]} />
      <Panel position={[halfWidth, height / 2, zc]} rotation={[0, -Math.PI / 2, 0]} size={[len, height]} />
      <Panel position={[0, height, zc]} rotation={[Math.PI / 2, 0, 0]} size={[halfWidth * 2, len]} color={WALL_DARK} />
      {strips.map((z) => (
        <group key={z}>
          <RedStrip position={[-halfWidth + 0.04, 2, z]} size={[0.06, 1.6, 0.08]} />
          <RedStrip position={[halfWidth - 0.04, 2, z]} size={[0.06, 1.6, 0.08]} />
        </group>
      ))}
      {/* Floor guide lights */}
      <RedStrip position={[-halfWidth + 0.35, 0.02, zc]} size={[0.07, 0.03, len - 1]} intensity={1.2} />
      <RedStrip position={[halfWidth - 0.35, 0.02, zc]} size={[0.07, 0.03, len - 1]} intensity={1.2} />
    </group>
  );
}

function Room({
  zFrom,
  zTo,
  halfWidth = 7,
  height = 4,
}: {
  zFrom: number;
  zTo: number;
  halfWidth?: number;
  height?: number;
}) {
  const len = Math.abs(zTo - zFrom);
  const zc = (zFrom + zTo) / 2;
  return (
    <group>
      <Panel position={[-halfWidth, height / 2, zc]} rotation={[0, Math.PI / 2, 0]} size={[len, height]} />
      <Panel position={[halfWidth, height / 2, zc]} rotation={[0, -Math.PI / 2, 0]} size={[len, height]} />
      <Panel position={[0, height, zc]} rotation={[Math.PI / 2, 0, 0]} size={[halfWidth * 2, len]} color={WALL_DARK} />
      {/* Accent ring light along the walls */}
      <RedStrip position={[-halfWidth + 0.04, 3.3, zc]} size={[0.05, 0.08, len - 0.5]} intensity={1.4} />
      <RedStrip position={[halfWidth - 0.04, 3.3, zc]} size={[0.05, 0.08, len - 0.5]} intensity={1.4} />
      {/* Cool ceiling light */}
      <mesh position={[0, height - 0.02, zc]}>
        <boxGeometry args={[2.4, 0.05, 1.2]} />
        <meshStandardMaterial
          color="#fff"
          emissive="#ffe5da"
          emissiveIntensity={1.6}
        />
      </mesh>
      <pointLight position={[0, height - 0.6, zc]} color="#ffe2d4" intensity={10} distance={13} />
    </group>
  );
}

/** Big wall monitor in the games room. The camera dives into it and the DOM
 * project cards read as on-screen content. */
function ProjectScreen() {
  const surfaceRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!surfaceRef.current) return;
    const t = state.clock.elapsedTime;
    // CRT-style idle flicker
    surfaceRef.current.emissiveIntensity =
      0.55 + Math.sin(t * 13.7) * 0.05 + Math.sin(t * 2.3) * 0.08;
  });

  return (
    <group position={[-3.8, 2.1, -23.9]}>
      {/* Bezel */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[6.0, 3.3, 0.12]} />
        <meshStandardMaterial color="#1c161f" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Display surface */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[5.6, 2.9]} />
        <meshStandardMaterial
          ref={surfaceRef}
          color="#0b070d"
          emissive="#2a0e16"
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {/* Power strip under the bezel */}
      <RedStrip position={[0, -1.78, 0.05]} size={[5.6, 0.06, 0.05]} intensity={1.8} />
      {/* Glow cast into the room */}
      <pointLight position={[0, 0, 1.4]} color="#ff3040" intensity={4} distance={6} />
    </group>
  );
}

/** Exterior observation walkway beyond the airlock — solid ground in space. */
function Platform() {
  const posts = [];
  for (let z = -45; z >= -57; z -= 2) posts.push(z);
  return (
    <group>
      {/* Deck */}
      <mesh position={[0, -0.05, -50.75]}>
        <boxGeometry args={[5, 0.12, 13.5]} />
        <meshStandardMaterial color="#14101a" roughness={0.8} metalness={0.35} />
      </mesh>
      {/* Edge guide lights */}
      <RedStrip position={[-2.4, 0.04, -50.75]} size={[0.08, 0.03, 13]} intensity={1.6} />
      <RedStrip position={[2.4, 0.04, -50.75]} size={[0.08, 0.03, 13]} intensity={1.6} />

      {/* Railings */}
      {posts.map((z) => (
        <group key={z}>
          <mesh position={[-2.42, 0.55, z]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
            <meshStandardMaterial color="#241d28" roughness={0.6} metalness={0.5} />
          </mesh>
          <mesh position={[2.42, 0.55, z]}>
            <boxGeometry args={[0.06, 1.1, 0.06]} />
            <meshStandardMaterial color="#241d28" roughness={0.6} metalness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[-2.42, 1.1, -50.75]}>
        <boxGeometry args={[0.07, 0.07, 13.2]} />
        <meshStandardMaterial color="#2c2330" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[2.42, 1.1, -50.75]}>
        <boxGeometry args={[0.07, 0.07, 13.2]} />
        <meshStandardMaterial color="#2c2330" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* End railing */}
      <mesh position={[0, 1.1, -57.45]}>
        <boxGeometry args={[4.9, 0.07, 0.07]} />
        <meshStandardMaterial color="#2c2330" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, -57.45]}>
        <boxGeometry args={[4.9, 1.1, 0.05]} />
        <meshStandardMaterial
          color="#16121c"
          roughness={0.7}
          metalness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

/**
 * The v4 set: hero spot → corridor → games room → corridor → updates room →
 * airlock → open space with a red giant. Walls are inward-facing planes so
 * the camera never gets a face full of geometry if it briefly exits the set.
 */
export function Facility({
  avatarRef,
}: {
  avatarRef: MutableRefObject<THREE.Group | null>;
}) {
  return (
    <group>
      {/* Floor for the whole facility */}
      <mesh position={[0, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 56]} />
        <meshStandardMaterial color={FLOOR} roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Hero chamber + corridor A */}
      <Corridor zFrom={3} zTo={-12} />
      <Rib z={-2.5} />
      <Rib z={-6} />
      <Rib z={-9.5} />
      <CeilingPipes zFrom={3} zTo={-12} x={-2.5} />
      <HazardStrip z={-10.8} />
      <DoorwayWall z={-12} halfWidth={7} />
      <Door z={-12} avatarRef={avatarRef} />

      {/* Games room */}
      <Room zFrom={-12} zTo={-24} />
      <ProjectScreen />
      <Console position={[6.3, 0, -19]} rotationY={-Math.PI / 2} />
      <Crate position={[5.6, 0, -13.6]} rotation={0.3} />
      <Crate position={[6.2, 0, -15]} rotation={-0.15} />
      <Crate position={[6.2, 0.85, -15]} size={0.6} rotation={0.5} />
      <Crate position={[-6.1, 0, -22.6]} rotation={0.8} />
      <DoorwayWall z={-24} halfWidth={7} />

      {/* Corridor B */}
      <Corridor zFrom={-24} zTo={-34} />
      <Rib z={-26.5} />
      <Rib z={-30} />
      <Rib z={-33} />
      <CeilingPipes zFrom={-24} zTo={-34} x={2.5} />
      <HazardStrip z={-32.8} />
      <DoorwayWall z={-34} halfWidth={7} />
      <Door z={-34} avatarRef={avatarRef} />

      {/* Updates room */}
      <Room zFrom={-34} zTo={-44} />
      <Console position={[-6.3, 0, -37.5]} rotationY={Math.PI / 2} />
      <Console position={[6.3, 0, -40.5]} rotationY={-Math.PI / 2} />
      <Crate position={[5.8, 0, -35.6]} rotation={0.4} />
      <Crate position={[-6.2, 0, -42.7]} rotation={-0.3} />
      <Crate position={[-6.2, 0.85, -42.7]} size={0.58} rotation={0.9} />
      <HazardStrip z={-42.8} />

      {/* Airlock: bigger door, opens to space */}
      <DoorwayWall z={-44} halfWidth={7} gap={1.7} gapHeight={3.6} />
      <Door z={-44} avatarRef={avatarRef} width={3.4} height={3.6} />

      {/* Back wall behind the hero start */}
      <Panel position={[0, 2, 3]} rotation={[0, Math.PI, 0]} size={[6, 4]} />

      {/* Dim red corridor lights */}
      <pointLight position={[0, 3.2, -6]} color={RED} intensity={5} distance={10} />
      <pointLight position={[0, 3.2, -29]} color={RED} intensity={5} distance={10} />

      <Platform />
    </group>
  );
}
