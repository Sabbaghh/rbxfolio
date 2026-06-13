'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PLANET_CENTER = new THREE.Vector3(0, 2.2, -30);
export const PLANET_RADIUS = 4.5;

const CUBE_COLORS = ['#a855f7', '#ec4899', '#60a5fa', '#22d3ee'];

/**
 * Stylized low-poly planet. The whole surface group rotates around the z-axis
 * so the ground (and the cubes on it) slide under the avatar standing on top,
 * selling the "walking around the planet" illusion.
 */
export function Planet() {
  const surfaceRef = useRef<THREE.Group>(null);

  const cubes = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 28 }, (_, i) => {
      // Random point on the sphere, biased toward the "equator" the avatar
      // walks along (the x/y great circle, since rotation is around z).
      const theta = rng(0, Math.PI * 2);
      const zJitter = rng(-0.35, 0.35);
      const dir = new THREE.Vector3(
        Math.cos(theta) * Math.cos(zJitter),
        Math.sin(theta) * Math.cos(zJitter),
        Math.sin(zJitter),
      ).normalize();
      const size = rng(0.12, 0.38);
      const pos = dir.clone().multiplyScalar(PLANET_RADIUS + size * 0.3);
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      );
      return {
        position: pos,
        quaternion: quat,
        size,
        color: CUBE_COLORS[i % CUBE_COLORS.length],
        emissive: i % 3 === 0,
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!surfaceRef.current) return;
    // Negative: ground moves +x at the top, avatar faces -x → walks forward.
    surfaceRef.current.rotation.z -= delta * 0.22;
  });

  return (
    <group position={PLANET_CENTER}>
      {/* Rotating surface: terrain + cubes */}
      <group ref={surfaceRef}>
        <mesh>
          <icosahedronGeometry args={[PLANET_RADIUS, 4]} />
          <meshStandardMaterial
            color="#2a1f4d"
            emissive="#170f33"
            emissiveIntensity={0.6}
            roughness={0.95}
            flatShading
          />
        </mesh>

        {cubes.map((c, i) => (
          <mesh key={i} position={c.position} quaternion={c.quaternion}>
            <boxGeometry args={[c.size, c.size, c.size]} />
            <meshStandardMaterial
              color={c.color}
              emissive={c.color}
              emissiveIntensity={c.emissive ? 1.8 : 0.25}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>

      {/* Atmosphere glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[PLANET_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Ring */}
      <group rotation={[Math.PI / 2.6, 0, 0.4]}>
        <mesh>
          <torusGeometry args={[PLANET_RADIUS * 1.55, 0.05, 12, 96]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={1.4}
            roughness={0.5}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[PLANET_RADIUS * 1.75, 0.02, 8, 96]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.2}
            roughness={0.5}
          />
        </mesh>
      </group>

      <pointLight position={[6, 6, 6]} color="#c4b5fd" intensity={40} />
    </group>
  );
}
