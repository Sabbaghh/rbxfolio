'use client';

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Sparkles, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const NEON = ['#a855f7', '#ec4899', '#60a5fa', '#22d3ee'];
const BACKGROUND = '#0e0b16';

interface BlockSpec {
  position: [number, number, number];
  color: string;
  size: number;
  rotSpeed: number;
  bobSpeed: number;
  bobPhase: number;
}

function FloatingBlocks({ count = 16 }: { count?: number }) {
  const specs = useMemo<BlockSpec[]>(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: count }, (_, i) => ({
      position: [
        rng(-14, 14),
        rng(0.5, 7),
        rng(-18, -3),
      ] as [number, number, number],
      color: NEON[i % NEON.length],
      size: rng(0.25, 0.9),
      rotSpeed: rng(0.1, 0.5) * (Math.random() > 0.5 ? 1 : -1),
      bobSpeed: rng(0.3, 0.8),
      bobPhase: rng(0, Math.PI * 2),
    }));
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = specs[i];
      child.rotation.x = t * s.rotSpeed;
      child.rotation.y = t * s.rotSpeed * 1.3;
      child.position.y = s.position[1] + Math.sin(t * s.bobSpeed + s.bobPhase) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {specs.map((s, i) => (
        <RoundedBox
          key={i}
          args={[s.size, s.size, s.size]}
          radius={s.size * 0.12}
          position={s.position}
        >
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={1.6}
            roughness={0.3}
            metalness={0.2}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

function MovingGrid() {
  const gridRef = useRef<any>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    // Scroll the grid toward the camera. The wrap interval must equal
    // sectionSize so the snap back lands on an identical pattern (seamless).
    gridRef.current.position.z = (state.clock.elapsedTime * 1.2) % 4;
  });

  return (
    <Grid
      ref={gridRef}
      position={[0, 0, 0]}
      args={[40, 40]}
      cellSize={1}
      cellThickness={0.6}
      cellColor="#4c3a8a"
      sectionSize={4}
      sectionThickness={1.2}
      sectionColor="#7c3aed"
      fadeDistance={32}
      fadeStrength={1.5}
      infiniteGrid
    />
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();

  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      mouse.x * 1.2,
      delta * 2,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      2.2 + mouse.y * 0.5,
      delta * 2,
    );
    camera.lookAt(0, 1.5, -8);
  });

  return null;
}

export function HeroBackground3D() {
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);

    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 2.2, 6], fov: 50 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[BACKGROUND]} />
        <fog attach="fog" args={[BACKGROUND, 12, 34]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 6, -6]} color="#a855f7" intensity={1.5} />

          <MovingGrid />
          <FloatingBlocks count={isMobile ? 8 : 16} />
          <Sparkles
            count={isMobile ? 40 : 90}
            scale={[30, 12, 24]}
            position={[0, 5, -10]}
            size={1.6}
            speed={0.25}
            opacity={0.55}
            color="#c4b5fd"
          />
          <CameraRig />

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.35}
              luminanceSmoothing={0.7}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.85} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Fade the 3D scene into the page background at the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
