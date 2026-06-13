'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TREE_GREENS = ['#3f9b43', '#4caf50', '#5cbf5f'];

export function Tree({
  position,
  scale = 1,
  rotation = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.7, 6]} />
        <meshStandardMaterial color="#8d6442" roughness={0.9} flatShading />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.95 + i * 0.55, 0]}>
          <coneGeometry args={[0.85 - i * 0.22, 0.85, 7]} />
          <meshStandardMaterial
            color={TREE_GREENS[i % TREE_GREENS.length]}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function House({
  position,
  color,
  rotation = 0,
}: {
  position: [number, number, number];
  color: string;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.8, 1.6, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
      {/* Pyramid roof */}
      <mesh position={[0, 1.95, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.5, 0.8, 4]} />
        <meshStandardMaterial color="#7a4a32" roughness={0.85} flatShading />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.45, 0.81]}>
        <boxGeometry args={[0.45, 0.9, 0.05]} />
        <meshStandardMaterial color="#5b3a28" roughness={0.9} />
      </mesh>
      {/* Window */}
      <mesh position={[0.55, 1.05, 0.81]}>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial
          color="#bfe8ff"
          emissive="#bfe8ff"
          emissiveIntensity={0.25}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export function Cloud({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[1.1, -0.1, 0.2]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[-1.0, -0.15, -0.1]}>
        <sphereGeometry args={[0.75, 12, 12]} />
        <meshStandardMaterial color="#f4f9ff" roughness={1} />
      </mesh>
    </group>
  );
}

function DriftingClouds() {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 8 }, () => ({
      position: [rng(-35, 35), rng(8, 16), rng(-38, 2)] as [
        number,
        number,
        number,
      ],
      scale: rng(0.8, 2.0),
      speed: rng(0.2, 0.5),
    }));
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * delta;
      if (cloud.position.x > 42) cloud.position.x = -42;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <Cloud key={i} position={c.position} scale={c.scale} />
      ))}
    </group>
  );
}

function Mountains() {
  const mountains = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2 + rng(-0.12, 0.12);
      const radius = rng(38, 50);
      return {
        position: [
          Math.cos(angle) * radius,
          -0.5,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        height: rng(9, 17),
        width: rng(5, 9),
        color: i % 3 === 0 ? '#6fae72' : '#8d99a6',
      };
    });
  }, []);

  return (
    <group>
      {mountains.map((m, i) => (
        <mesh key={i} position={m.position}>
          <coneGeometry args={[m.width, m.height, 5]} />
          <meshStandardMaterial color={m.color} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Bright low-poly island world: grass, trees, houses, mountains, sea. */
export function LowPolyWorld() {
  const trees = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 14 }, () => {
      const angle = rng(0, Math.PI * 2);
      const radius = rng(6, 16);
      return {
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [
          number,
          number,
          number,
        ],
        scale: rng(0.7, 1.5),
        rotation: rng(0, Math.PI * 2),
      };
    });
  }, []);

  return (
    <group>
      {/* Sea */}
      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#3aa8d8" roughness={0.6} />
      </mesh>

      {/* Island */}
      <mesh position={[0, -0.26, 0]}>
        <cylinderGeometry args={[20, 22, 0.6, 24]} />
        <meshStandardMaterial color="#5fc457" roughness={0.9} flatShading />
      </mesh>

      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}

      <House position={[-5.5, 0, -6]} color="#d9453c" rotation={0.5} />
      <House position={[6.5, 0, -8]} color="#f2c038" rotation={-0.4} />
      <House position={[-8.5, 0, 3]} color="#3f7fd9" rotation={1.2} />

      <Mountains />
      <DriftingClouds />
    </group>
  );
}
