'use client';

import { useRef, useMemo, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { buildRig, normalizeRig } from '@/components/avatar-rig';

export type AvatarPose =
  | 'float'
  | 'idle'
  | 'walk'
  | 'wave'
  | 'cheer'
  | 'present';

const AVATAR_URL = '/avatar.glb';
// World height of the avatar in the v2 scene.
export const AVATAR_HEIGHT = 2.2;

const lerp = THREE.MathUtils.lerp;

/**
 * The avatar with feet at local y=0. All pose animation is applied to inner
 * groups, so a parent group can be positioned/rotated freely by the scene
 * director without fighting the animation.
 */
export function SabbzAvatarV2({
  poseRef,
  lookRef,
}: {
  poseRef: MutableRefObject<AvatarPose>;
  /** Normalized mouse (-1..1); when provided the head tracks it. */
  lookRef?: MutableRefObject<{ x: number; y: number }>;
}) {
  const { scene } = useGLTF(AVATAR_URL);
  const innerRef = useRef<THREE.Group>(null);

  const rig = useMemo(() => {
    const built = buildRig(scene);
    const wrapper = normalizeRig(built, {
      height: AVATAR_HEIGHT,
      footY: 0,
      facingY: Math.PI,
    });
    return { ...built, wrapper };
  }, [scene]);

  useFrame((state, delta) => {
    const inner = innerRef.current;
    if (!inner) return;
    const t = state.clock.elapsedTime;
    const pose = poseRef.current;

    // Targets (values are final applied rotations; signs account for the
    // 180° model flip in normalizeRig).
    let armL = 0.08 + Math.sin(t * 1.8) * 0.04; // rotation.z
    let armR = -0.08 - Math.sin(t * 1.8) * 0.04;
    let armLX = -0.08; // rotation.x (forward/back swing)
    let armRX = -0.08;
    let legLX = 0;
    let legRX = 0;
    let bob = 0;
    let headX = 0;
    let headZ = 0;

    if (pose === 'float') {
      bob = 0.25 + Math.sin(t * 1.5) * 0.14;
      armL = 0.25;
      armR = -0.25;
      legLX = 0.12;
      legRX = -0.08;
    } else if (pose === 'walk') {
      const w = Math.sin(t * 7);
      legLX = w * 0.55;
      legRX = -w * 0.55;
      armLX = -w * 0.35;
      armRX = w * 0.35;
      bob = Math.abs(Math.cos(t * 7)) * 0.06;
      headX = 0.06;
    } else if (pose === 'wave') {
      armR = -(Math.PI * 0.85 + Math.sin(t * 12) * 0.4);
      bob = 0.05 + Math.sin(t * 1.5) * 0.05;
      headZ = -0.08;
    } else if (pose === 'cheer') {
      armL = Math.PI * 0.8;
      armR = -Math.PI * 0.8;
      bob = Math.abs(Math.sin(t * 8)) * 0.18;
    } else if (pose === 'present') {
      // "Look at this" — right arm extended to the side
      armR = -(1.25 + Math.sin(t * 1.6) * 0.06);
      armRX = -0.25;
      headZ = -0.06;
    }

    inner.position.y = lerp(inner.position.y, bob, delta * 8);

    if (rig.leftShoulder) {
      rig.leftShoulder.rotation.z = lerp(rig.leftShoulder.rotation.z, armL, delta * 8);
      rig.leftShoulder.rotation.x = lerp(rig.leftShoulder.rotation.x, armLX, delta * 8);
    }
    if (rig.rightShoulder) {
      rig.rightShoulder.rotation.z = lerp(rig.rightShoulder.rotation.z, armR, delta * 8);
      rig.rightShoulder.rotation.x = lerp(rig.rightShoulder.rotation.x, armRX, delta * 8);
    }
    if (rig.leftHip) {
      rig.leftHip.rotation.x = lerp(rig.leftHip.rotation.x, legLX, delta * 8);
    }
    if (rig.rightHip) {
      rig.rightHip.rotation.x = lerp(rig.rightHip.rotation.x, legRX, delta * 8);
    }
    if (rig.headPivot) {
      let headY = Math.sin(t * 0.7) * 0.08; // subtle living motion
      if (lookRef) {
        // Eye contact: head tracks the user's cursor
        headY = THREE.MathUtils.clamp(lookRef.current.x * 0.55, -0.7, 0.7);
        headX += THREE.MathUtils.clamp(-lookRef.current.y * 0.35, -0.4, 0.4);
      }
      rig.headPivot.rotation.x = lerp(rig.headPivot.rotation.x, headX, delta * 6);
      rig.headPivot.rotation.z = lerp(rig.headPivot.rotation.z, headZ, delta * 6);
      rig.headPivot.rotation.y = lerp(rig.headPivot.rotation.y, headY, delta * 6);
    }
  });

  return (
    <group ref={innerRef}>
      <primitive object={rig.wrapper} />
    </group>
  );
}

useGLTF.preload(AVATAR_URL);
