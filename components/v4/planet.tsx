'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const CRIMSON_PLANET_CENTER = new THREE.Vector3(0, -8.2, -70);
export const CRIMSON_PLANET_RADIUS = 10;

const RED = '#ff2438';

interface Decoration {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  kind: 'crystal' | 'rock' | 'ember';
}

/**
 * The finale planet. The surface rolls toward the camera (rotation around x)
 * so the avatar standing on top reads as endlessly walking forward. Biased
 * decoration placement keeps crystals streaming through the visible band.
 */
export function CrimsonPlanet() {
  const surfaceRef = useRef<THREE.Group>(null);
  const beltRef = useRef<THREE.Group>(null);

  const decorations = useMemo<Decoration[]>(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    const up = new THREE.Vector3(0, 1, 0);
    return Array.from({ length: 52 }, (_, i) => {
      // Circles in the y/z plane sweep under the avatar (rotation is around
      // x), so bias placement toward small |x|.
      const theta = rng(0, Math.PI * 2);
      const xTilt = rng(-0.5, 0.5);
      const dir = new THREE.Vector3(
        Math.sin(xTilt),
        Math.cos(theta) * Math.cos(xTilt),
        Math.sin(theta) * Math.cos(xTilt),
      ).normalize();
      const kind: Decoration['kind'] =
        i % 4 === 0 ? 'rock' : i % 4 === 1 ? 'ember' : 'crystal';
      return {
        position: dir.clone().multiplyScalar(CRIMSON_PLANET_RADIUS - 0.05),
        quaternion: new THREE.Quaternion().setFromUnitVectors(up, dir),
        scale: rng(0.35, 1.1),
        kind,
      };
    });
  }, []);

  const belt = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 16 }, () => ({
      angle: rng(0, Math.PI * 2),
      radius: rng(15.8, 17.4),
      z: rng(-0.6, 0.6),
      size: rng(0.16, 0.5),
      rot: rng(0, Math.PI * 2),
    }));
  }, []);

  useFrame((_, delta) => {
    // Negative: the top surface moves away from the camera, so the avatar
    // (facing the camera) walks forward — and terrain rolls in from below.
    if (surfaceRef.current) surfaceRef.current.rotation.x -= delta * 0.16;
    if (beltRef.current) beltRef.current.rotation.z += delta * 0.04;
  });

  return (
    <group position={CRIMSON_PLANET_CENTER}>
      {/* Rotating surface */}
      <group ref={surfaceRef}>
        <mesh>
          <icosahedronGeometry args={[CRIMSON_PLANET_RADIUS, 5]} />
          <meshStandardMaterial
            color="#131017"
            emissive="#1c0a10"
            emissiveIntensity={0.35}
            roughness={0.95}
            flatShading
          />
        </mesh>

        {decorations.map((d, i) => (
          <group
            key={i}
            position={d.position}
            quaternion={d.quaternion}
            scale={d.scale}
          >
            {d.kind === 'crystal' && (
              <mesh rotation={[(i % 5) * 0.12 - 0.25, i, 0]}>
                <coneGeometry args={[0.22, 1.15, 5]} />
                <meshStandardMaterial
                  color="#3a0d14"
                  emissive={RED}
                  emissiveIntensity={1.7}
                  roughness={0.3}
                  flatShading
                />
              </mesh>
            )}
            {d.kind === 'rock' && (
              <mesh rotation={[i, i * 0.7, 0]}>
                <dodecahedronGeometry args={[0.45]} />
                <meshStandardMaterial
                  color="#221c26"
                  roughness={0.95}
                  flatShading
                />
              </mesh>
            )}
            {d.kind === 'ember' && (
              <mesh>
                <sphereGeometry args={[0.13, 8, 8]} />
                <meshStandardMaterial
                  color="#100505"
                  emissive="#ff5a30"
                  emissiveIntensity={2.4}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Atmosphere */}
      <mesh scale={1.06}>
        <sphereGeometry args={[CRIMSON_PLANET_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={RED}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Double ring + orbiting debris */}
      <group rotation={[Math.PI / 2.35, 0, 0.25]}>
        <mesh>
          <torusGeometry args={[16.5, 0.18, 8, 96]} />
          <meshStandardMaterial
            color="#2a1016"
            emissive={RED}
            emissiveIntensity={0.55}
            roughness={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[18.4, 0.06, 6, 96]} />
          <meshStandardMaterial
            color="#2a1016"
            emissive={RED}
            emissiveIntensity={0.9}
            roughness={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
        <group ref={beltRef}>
          {belt.map((b, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(b.angle) * b.radius,
                Math.sin(b.angle) * b.radius,
                b.z,
              ]}
              rotation={[b.rot, b.rot * 1.4, 0]}
            >
              <dodecahedronGeometry args={[b.size]} />
              <meshStandardMaterial
                color="#1d1620"
                emissive="#43141b"
                emissiveIntensity={0.5}
                roughness={0.95}
                flatShading
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Embers rising off the sunlit crest */}
      <Sparkles
        count={50}
        scale={[12, 5, 8]}
        position={[0, CRIMSON_PLANET_RADIUS + 0.8, 0]}
        size={2.2}
        speed={0.35}
        opacity={0.55}
        color="#ff5a4a"
      />

      {/* Red key light + cold back light for silhouette contrast */}
      <pointLight
        position={[16, 12, 10]}
        color={RED}
        intensity={900}
        distance={70}
        decay={1.8}
      />
      <pointLight
        position={[-18, 4, -12]}
        color="#5a6cff"
        intensity={260}
        distance={80}
        decay={1.8}
      />
    </group>
  );
}
