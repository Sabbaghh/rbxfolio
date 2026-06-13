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
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import {
  SabbzAvatarV2,
  type AvatarPose,
} from '@/components/v2/sabbz-avatar';
import { LowPolyWorld, Cloud } from '@/components/v3/world';
import {
  MiniPlanet,
  MINI_PLANET_CENTER,
  MINI_PLANET_RADIUS,
} from '@/components/v3/mini-planet';

const SKY = '#5ec8ea';

interface Keyframe {
  cam: [number, number, number];
  tgt: [number, number, number];
  av: [number, number, number];
  rotY: number;
  pose: AvatarPose;
}

const AVATAR_ON_PLANET_Y = MINI_PLANET_CENTER.y + MINI_PLANET_RADIUS;

const KEYFRAMES: Keyframe[] = [
  // 0 — Hero: standing on the island, waving
  {
    cam: [0, 2.1, 7.2],
    tgt: [0.7, 1.5, 0],
    av: [2.1, 0, 0.5],
    rotY: -0.4,
    pose: 'wave',
  },
  // 1 — Work: avatar steps aside for the cards
  {
    cam: [-1.2, 3.0, 8.6],
    tgt: [0, 1.0, -1],
    av: [-3.8, 0, 1.2],
    rotY: 0.5,
    pose: 'idle',
  },
  // 2 — Mini planet: fly up through the clouds, walk the little world
  {
    cam: [0, 8.3, -21.2],
    tgt: [0, 6.6, -30],
    av: [0, AVATAR_ON_PLANET_Y, -30],
    rotY: -Math.PI / 2,
    pose: 'walk',
  },
  // 3 — Updates: standing on a cloud, planet behind
  {
    cam: [4.6, 3.0, -13.4],
    tgt: [0, 1.8, -11],
    av: [0, 1.0, -11],
    rotY: 0.35,
    pose: 'idle',
  },
  // 4 — CTA: close-up wave on the cloud
  {
    cam: [0, 1.9, -7.4],
    tgt: [0, 1.4, -11],
    av: [0, 1.0, -11],
    rotY: 0,
    pose: 'wave',
  },
];

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
        document.querySelectorAll<HTMLElement>('[data-v3-section]'),
      );
      topsRef.current = sections.map(
        (el) => el.getBoundingClientRect().top + window.scrollY,
      );
    };
    measure();
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

export function V3Scene() {
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const avatarRef = useRef<THREE.Group | null>(null);
  const poseRef = useRef<AvatarPose>('wave');
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
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[SKY]} />
        <fog attach="fog" args={[SKY, 26, 68]} />

        <Suspense fallback={null}>
          {/* Cartoon daylight: warm sun + sky/grass hemisphere bounce */}
          <hemisphereLight args={['#bfe8ff', '#7ec850', 0.75]} />
          <directionalLight
            position={[18, 28, 12]}
            intensity={1.8}
            color="#fff6e0"
          />

          <LowPolyWorld />
          <MiniPlanet />

          {/* Cloud platform for the updates/CTA sections */}
          <Cloud position={[0, -0.35, -11]} scale={1.4} />

          <group ref={avatarRef}>
            <SabbzAvatarV2 poseRef={poseRef} />
            {/* Blob shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <circleGeometry args={[0.85, 24]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.16} />
            </mesh>
          </group>

          <Director avatarRef={avatarRef} poseRef={poseRef} mouseRef={mouseRef} />

          <Environment preset="park" />
        </Suspense>
      </Canvas>
    </div>
  );
}
