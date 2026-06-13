'use client';

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  Suspense,
  type MutableRefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Stars, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  SabbzAvatarV2,
  type AvatarPose,
} from '@/components/v2/sabbz-avatar';
import { Planet, PLANET_CENTER, PLANET_RADIUS } from '@/components/v2/planet';

const BACKGROUND = '#0e0b16';
const NEON = ['#a855f7', '#ec4899', '#60a5fa', '#22d3ee'];

// One keyframe per [data-v2-section]. The camera/avatar interpolate between
// adjacent keyframes as the user scrolls from one section top to the next.
interface Keyframe {
  cam: [number, number, number];
  tgt: [number, number, number];
  av: [number, number, number];
  rotY: number;
  pose: AvatarPose;
}

const AVATAR_ON_PLANET_Y = PLANET_CENTER.y + PLANET_RADIUS;

const KEYFRAMES: Keyframe[] = [
  // 0 — Hero: grid world, avatar floating right of the text
  {
    cam: [0, 2.1, 7.2],
    tgt: [0.7, 1.5, 0],
    av: [2.1, 0.35, 0.5],
    rotY: -0.4,
    pose: 'float',
  },
  // 1 — Work: camera drifts, avatar steps aside for the cards
  {
    cam: [-1.2, 3.0, 8.6],
    tgt: [0, 1.0, -1],
    av: [-3.8, 0.3, 1.2],
    rotY: 0.5,
    pose: 'idle',
  },
  // 2 — Planet: fly through space, avatar walks the planet
  {
    cam: [0, 8.3, -21.2],
    tgt: [0, 6.6, -30],
    av: [0, AVATAR_ON_PLANET_Y, -30],
    rotY: -Math.PI / 2,
    pose: 'walk',
  },
  // 3 — Updates: side view in open space, planet far behind
  {
    cam: [4.6, 3.0, -13.4],
    tgt: [0, 1.8, -11],
    av: [0, 0.5, -11],
    rotY: 0.35,
    pose: 'float',
  },
  // 4 — CTA: close-up, wave
  {
    cam: [0, 1.9, -7.4],
    tgt: [0, 1.4, -11],
    av: [0, 0.45, -11],
    rotY: 0,
    pose: 'wave',
  },
];

function MovingGrid() {
  const gridRef = useRef<any>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    // Wrap interval must equal sectionSize for a seamless loop.
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
      fadeDistance={30}
      fadeStrength={1.5}
      infiniteGrid
    />
  );
}

interface BlockSpec {
  position: [number, number, number];
  color: string;
  size: number;
  rotSpeed: number;
  bobSpeed: number;
  bobPhase: number;
}

function BlocksCluster({
  count,
  x,
  y,
  z,
}: {
  count: number;
  x: [number, number];
  y: [number, number];
  z: [number, number];
}) {
  const specs = useMemo<BlockSpec[]>(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: count }, (_, i) => ({
      position: [rng(...x), rng(...y), rng(...z)] as [number, number, number],
      color: NEON[i % NEON.length],
      size: rng(0.2, 0.8),
      rotSpeed: rng(0.1, 0.5) * (Math.random() > 0.5 ? 1 : -1),
      bobSpeed: rng(0.3, 0.8),
      bobPhase: rng(0, Math.PI * 2),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = specs[i];
      child.rotation.x = t * s.rotSpeed;
      child.rotation.y = t * s.rotSpeed * 1.3;
      child.position.y =
        s.position[1] + Math.sin(t * s.bobSpeed + s.bobPhase) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {specs.map((s, i) => (
        <mesh key={i} position={s.position}>
          <boxGeometry args={[s.size, s.size, s.size]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={1.6}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function Director({
  avatarRef,
  poseRef,
  mouseRef,
}: {
  avatarRef: MutableRefObject<THREE.Group | null>;
  poseRef: MutableRefObject<AvatarPose>;
  mouseRef: MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  const topsRef = useRef<number[]>([0]);

  useEffect(() => {
    const measure = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-v2-section]'),
      );
      topsRef.current = sections.map(
        (el) => el.getBoundingClientRect().top + window.scrollY,
      );
    };
    measure();
    // Re-measure when async content (games/tweets) changes the page height.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const cur = useMemo(
    () => ({
      cam: new THREE.Vector3(...KEYFRAMES[0].cam),
      tgt: new THREE.Vector3(...KEYFRAMES[0].tgt),
      av: new THREE.Vector3(...KEYFRAMES[0].av),
      rotY: KEYFRAMES[0].rotY,
      look: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const tops = topsRef.current;
    const scroll = window.scrollY;

    // Find the active segment and eased local progress within it.
    let i = 0;
    let local = 0;
    for (let s = 0; s < KEYFRAMES.length - 1; s++) {
      const a = tops[s] ?? 0;
      const b = tops[s + 1] ?? a + 1;
      if (scroll >= a) {
        i = s;
        local = Math.min(1, Math.max(0, (scroll - a) / Math.max(1, b - a)));
      }
    }
    const e = THREE.MathUtils.smootherstep(local, 0, 1);

    const a = KEYFRAMES[i];
    const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];

    const tCam = new THREE.Vector3(...a.cam).lerp(new THREE.Vector3(...b.cam), e);
    const tTgt = new THREE.Vector3(...a.tgt).lerp(new THREE.Vector3(...b.tgt), e);
    const tAv = new THREE.Vector3(...a.av).lerp(new THREE.Vector3(...b.av), e);
    const tRotY = THREE.MathUtils.lerp(a.rotY, b.rotY, e);

    // Frame-rate independent smoothing on top of the scroll mapping.
    const k = 1 - Math.exp(-4 * delta);
    cur.cam.lerp(tCam, k);
    cur.tgt.lerp(tTgt, k);
    cur.av.lerp(tAv, k);
    cur.rotY = THREE.MathUtils.lerp(cur.rotY, tRotY, k);

    const m = mouseRef.current;
    camera.position.set(
      cur.cam.x + m.x * 0.6,
      cur.cam.y + m.y * 0.35,
      cur.cam.z,
    );
    cur.look.copy(cur.tgt);
    camera.lookAt(cur.look);

    if (avatarRef.current) {
      avatarRef.current.position.copy(cur.av);
      avatarRef.current.rotation.y = cur.rotY;
    }

    poseRef.current = local < 0.5 ? a.pose : b.pose;
  });

  return null;
}

export function V2Scene() {
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const avatarRef = useRef<THREE.Group | null>(null);
  const poseRef = useRef<AvatarPose>('float');
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);

    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);

    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove);

    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: KEYFRAMES[0].cam, fov: 50 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[BACKGROUND]} />
        <fog attach="fog" args={[BACKGROUND, 14, 36]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 5]} intensity={1.1} />
          <pointLight position={[0, 6, -6]} color="#a855f7" intensity={1.4} />

          <MovingGrid />
          <Stars
            radius={70}
            depth={40}
            count={isMobile ? 1200 : 3000}
            factor={3}
            saturation={0.4}
            fade
            speed={0.6}
          />

          {/* Hero world blocks */}
          <BlocksCluster
            count={isMobile ? 7 : 14}
            x={[-14, 14]}
            y={[0.5, 7]}
            z={[-17, -3]}
          />
          {/* Deep space blocks (updates / CTA area) */}
          <BlocksCluster
            count={isMobile ? 5 : 10}
            x={[-8, 8]}
            y={[0, 5]}
            z={[-18, -9]}
          />

          <Sparkles
            count={isMobile ? 40 : 80}
            scale={[30, 14, 30]}
            position={[0, 5, -12]}
            size={1.6}
            speed={0.25}
            opacity={0.5}
            color="#c4b5fd"
          />

          <Planet />

          <group ref={avatarRef}>
            <SabbzAvatarV2 poseRef={poseRef} />
          </group>

          <Director avatarRef={avatarRef} poseRef={poseRef} mouseRef={mouseRef} />

          <Environment preset="city" />

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
