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
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  SabbzAvatarV2,
  type AvatarPose,
} from '@/components/v2/sabbz-avatar';
import { Facility } from '@/components/v4/facility';
import {
  CrimsonPlanet,
  CRIMSON_PLANET_CENTER,
  CRIMSON_PLANET_RADIUS,
} from '@/components/v4/planet';

const BACKGROUND = '#070407';

type RestCam =
  | { mode: 'face' }
  | { mode: 'orbit'; radius: number }
  | { mode: 'fixed'; cam: [number, number, number]; tgt: [number, number, number] };

interface Keyframe {
  av: [number, number, number];
  rotY: number;
  pose: AvatarPose;
  rest: RestCam;
  fogFar: number;
}

const KEYFRAMES: Keyframe[] = [
  // 0 — Hero: face close-up, avatar looks at the visitor
  { av: [0, 0, 0], rotY: 0, pose: 'idle', rest: { mode: 'face' }, fogFar: 26 },
  // 1 — Corridor A transit beat: more walking screen time
  {
    av: [0, 0, -7],
    rotY: Math.PI,
    pose: 'idle',
    rest: { mode: 'orbit', radius: 2.2 },
    fogFar: 26,
  },
  // 2 — Games room: avatar idles by the wall monitor while the visitor
  // browses the project cards
  {
    av: [-0.8, 0, -18],
    rotY: Math.PI,
    pose: 'idle',
    rest: { mode: 'orbit', radius: 2.7 },
    fogFar: 26,
  },
  // 3 — Corridor B transit beat
  {
    av: [0, 0, -29],
    rotY: Math.PI,
    pose: 'idle',
    rest: { mode: 'orbit', radius: 2.2 },
    fogFar: 26,
  },
  // 4 — Updates room
  {
    av: [-0.8, 0, -39],
    rotY: Math.PI,
    pose: 'present',
    rest: { mode: 'orbit', radius: 2.7 },
    fogFar: 26,
  },
  // 5 — Observation deck: out the airlock, under the stars
  {
    av: [0, 0, -50],
    rotY: Math.PI,
    pose: 'idle',
    rest: { mode: 'orbit', radius: 2.4 },
    fogFar: 160,
  },
  // 6 — CTA: on top of the planet, walking forever toward the camera.
  // Planet fills the lower half of frame, avatar fully in view.
  {
    av: [0, CRIMSON_PLANET_CENTER.y + CRIMSON_PLANET_RADIUS, -70],
    rotY: 0,
    pose: 'walk',
    rest: { mode: 'fixed', cam: [0, 3.2, -61.5], tgt: [0, 2.6, -70] },
    fogFar: 160,
  },
];

const front = (rotY: number) => new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY));
const right = (rotY: number) => new THREE.Vector3(-Math.cos(rotY), 0, Math.sin(rotY));

function restCamera(
  kf: Keyframe,
  time: number,
  outCam: THREE.Vector3,
  outTgt: THREE.Vector3,
) {
  const av = new THREE.Vector3(...kf.av);
  if (kf.rest.mode === 'face') {
    outCam
      .copy(av)
      .addScaledVector(front(kf.rotY), 2.6)
      .addScaledVector(right(kf.rotY), 0.45)
      .add(new THREE.Vector3(0, 1.7, 0));
    outTgt.copy(av).add(new THREE.Vector3(0, 1.5, 0));
  } else if (kf.rest.mode === 'orbit') {
    const ang = time * 0.22;
    outCam
      .copy(av)
      .add(
        new THREE.Vector3(
          Math.cos(ang) * kf.rest.radius,
          1.9 + Math.sin(time * 0.31) * 0.2,
          Math.sin(ang) * kf.rest.radius,
        ),
      );
    outTgt.copy(av).add(new THREE.Vector3(0, 1.7, 0));
  } else {
    outCam.set(...kf.rest.cam);
    outTgt.set(...kf.rest.tgt);
  }
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
  const { camera, scene } = useThree();
  const topsRef = useRef<number[]>([0]);

  useEffect(() => {
    const measure = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-v4-section]'),
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
      cam: new THREE.Vector3(0, 1.85, 1.6),
      tgt: new THREE.Vector3(0, 1.8, 0),
      av: new THREE.Vector3(...KEYFRAMES[0].av),
      prevAv: new THREE.Vector3(...KEYFRAMES[0].av),
      rotY: KEYFRAMES[0].rotY,
      fogFar: KEYFRAMES[0].fogFar,
      speed: 0,
      chase: 0,
      look: new THREE.Vector3(),
      restA: new THREE.Vector3(),
      tgtA: new THREE.Vector3(),
      restB: new THREE.Vector3(),
      tgtB: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const tops = topsRef.current;
    const scroll = window.scrollY;
    const time = state.clock.elapsedTime;

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

    // Avatar path
    const tAv = new THREE.Vector3(...a.av).lerp(new THREE.Vector3(...b.av), e);
    const tRotY = THREE.MathUtils.lerp(a.rotY, b.rotY, e);
    const forcedPose: AvatarPose | null = null;

    // Rest cameras for both keyframes, blended across the segment
    restCamera(a, time, cur.restA, cur.tgtA);
    restCamera(b, time, cur.restB, cur.tgtB);
    const restCam = cur.restA.clone().lerp(cur.restB, e);
    const restTgt = cur.tgtA.clone().lerp(cur.tgtB, e);

    // Over-the-shoulder camera, anchored to the avatar's ACTUAL smoothed
    // heading (cur.rotY from last frame) so it never swings to angles the
    // avatar isn't facing.
    const f = front(cur.rotY);
    const r = right(cur.rotY);
    const shoulderCam = tAv
      .clone()
      .addScaledVector(f, -2.8)
      .addScaledVector(r, 0.65)
      .add(new THREE.Vector3(0, 2.05, 0));
    const shoulderTgt = tAv
      .clone()
      .addScaledVector(f, 3.5)
      .add(new THREE.Vector3(0, 1.45, 0));

    // Chase cam engages with movement, rest cam when standing — the blend
    // itself is smoothed so there are no pops when scrolling stops/starts.
    const chaseTarget = THREE.MathUtils.smoothstep(cur.speed, 0.35, 1.1);
    cur.chase = THREE.MathUtils.lerp(
      cur.chase,
      chaseTarget,
      1 - Math.exp(-3 * delta),
    );
    const tCam = restCam.lerp(shoulderCam, cur.chase);
    const tTgt = restTgt.lerp(shoulderTgt, cur.chase);
    const tFogFar = THREE.MathUtils.lerp(a.fogFar, b.fogFar, e);

    // Smoothing
    const k = 1 - Math.exp(-4 * delta);
    cur.cam.lerp(tCam, k);
    cur.tgt.lerp(tTgt, k);
    cur.av.lerp(tAv, k);
    cur.fogFar = THREE.MathUtils.lerp(cur.fogFar, tFogFar, k);

    // Auto-walk: if the avatar is actually moving, he walks
    const velX = cur.av.x - cur.prevAv.x;
    const velZ = cur.av.z - cur.prevAv.z;
    const speed = cur.av.distanceTo(cur.prevAv) / Math.max(delta, 1e-4);
    cur.prevAv.copy(cur.av);
    cur.speed = speed;
    const restPose = local < 0.5 ? a.pose : b.pose;
    const walking = !forcedPose && speed > 0.55;
    poseRef.current = forcedPose ?? (walking ? 'walk' : restPose);

    // Facing: walk in the direction of travel; settle to the keyframe angle
    // when standing (or during the scripted leap). Shortest-path rotation.
    const rotTarget = walking ? Math.atan2(velX, velZ) : tRotY;
    const dAng =
      THREE.MathUtils.euclideanModulo(
        rotTarget - cur.rotY + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
    cur.rotY += dAng * (1 - Math.exp(-6 * delta));

    const m = mouseRef.current;
    camera.position.set(
      cur.cam.x + m.x * 0.18,
      cur.cam.y + m.y * 0.12,
      cur.cam.z,
    );
    cur.look.copy(cur.tgt);
    camera.lookAt(cur.look);

    if (avatarRef.current) {
      avatarRef.current.position.copy(cur.av);
      avatarRef.current.rotation.y = cur.rotY;
    }

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.far = cur.fogFar;
      scene.fog.near = cur.fogFar * 0.12;
    }
  });

  return null;
}

export function V4Scene() {
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const avatarRef = useRef<THREE.Group | null>(null);
  const poseRef = useRef<AvatarPose>('idle');
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
        camera={{ position: [0, 1.85, 1.6], fov: 45 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[BACKGROUND]} />
        <fog attach="fog" args={[BACKGROUND, 4, 26]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.16} />

          <Facility avatarRef={avatarRef} />
          <CrimsonPlanet />

          <Stars
            radius={90}
            depth={50}
            count={isMobile ? 1500 : 3500}
            factor={3.2}
            saturation={0.5}
            fade
            speed={0.4}
          />

          <group ref={avatarRef}>
            <SabbzAvatarV2 poseRef={poseRef} lookRef={mouseRef} />
            {/* Personal lighting rig so the face reads everywhere */}
            <pointLight
              position={[0.8, 2.6, 1.3]}
              color="#fff1e6"
              intensity={5}
              distance={7}
            />
            <pointLight
              position={[-0.7, 2.1, -1.4]}
              color="#ff2438"
              intensity={7}
              distance={6}
            />
            {/* Blob shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <circleGeometry args={[0.8, 24]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.35} />
            </mesh>
          </group>

          <Director avatarRef={avatarRef} poseRef={poseRef} mouseRef={mouseRef} />

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.7}
              luminanceThreshold={0.45}
              luminanceSmoothing={0.65}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.12} darkness={0.95} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
