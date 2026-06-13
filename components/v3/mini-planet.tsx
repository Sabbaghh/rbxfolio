'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tree, Cloud } from '@/components/v3/world';

export const MINI_PLANET_CENTER = new THREE.Vector3(0, 2.2, -30);
export const MINI_PLANET_RADIUS = 4.5;

/**
 * A little grass world floating in the sky. The surface group rotates around
 * the z-axis so the ground slides under the avatar standing on top.
 */
export function MiniPlanet() {
  const surfaceRef = useRef<THREE.Group>(null);

  const decorations = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 9 }, (_, i) => {
      // Biased toward the x/y great circle the avatar walks along.
      const theta = rng(0, Math.PI * 2);
      const zJitter = rng(-0.4, 0.4);
      const dir = new THREE.Vector3(
        Math.cos(theta) * Math.cos(zJitter),
        Math.sin(theta) * Math.cos(zJitter),
        Math.sin(zJitter),
      ).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      );
      return {
        position: dir.clone().multiplyScalar(MINI_PLANET_RADIUS - 0.05),
        quaternion: quat,
        scale: rng(0.5, 0.9),
        isRock: i % 3 === 2,
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!surfaceRef.current) return;
    // Ground moves +x at the top; avatar faces -x → walks forward.
    surfaceRef.current.rotation.z -= delta * 0.22;
  });

  return (
    <group position={MINI_PLANET_CENTER}>
      <group ref={surfaceRef}>
        <mesh>
          <icosahedronGeometry args={[MINI_PLANET_RADIUS, 3]} />
          <meshStandardMaterial color="#5fc457" roughness={0.9} flatShading />
        </mesh>

        {decorations.map((d, i) =>
          d.isRock ? (
            <mesh
              key={i}
              position={d.position}
              quaternion={d.quaternion}
              scale={d.scale}
            >
              <dodecahedronGeometry args={[0.35]} />
              <meshStandardMaterial
                color="#9aa7b3"
                roughness={0.95}
                flatShading
              />
            </mesh>
          ) : (
            <group key={i} position={d.position} quaternion={d.quaternion}>
              <Tree position={[0, 0, 0]} scale={d.scale} />
            </group>
          ),
        )}
      </group>

      {/* Little clouds orbiting the planet */}
      <Cloud position={[-7, 1.5, -1]} scale={0.6} />
      <Cloud position={[6.5, -1, 1]} scale={0.5} />
      <Cloud position={[1, 6.5, -2]} scale={0.45} />
    </group>
  );
}
