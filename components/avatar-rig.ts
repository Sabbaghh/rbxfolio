import * as THREE from 'three';

export interface AvatarRig {
  root: THREE.Group;
  headPivot: THREE.Group | null;
  leftShoulder: THREE.Group | null;
  rightShoulder: THREE.Group | null;
  leftHip: THREE.Group | null;
  rightHip: THREE.Group | null;
}

interface PartInfo {
  mesh: THREE.Object3D;
  box: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
  isAccessory: boolean;
}

/**
 * Builds an animatable rig from the static Studio OBJ export.
 * Body parts are numbered (Sabbz2z1..15) with world-baked geometry, so parts
 * are classified by bounding box: head = highest body part, arms = parts
 * outside the torso's x-range, legs = narrow parts below the torso.
 * Accessories (Handle*) near the head get attached to the head pivot so
 * hats/hair/masks follow head movement.
 */
export function buildRig(source: THREE.Group): AvatarRig {
  const root = source.clone(true);

  const parts: PartInfo[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const box = new THREE.Box3().setFromObject(obj);
      parts.push({
        mesh: obj,
        box,
        center: box.getCenter(new THREE.Vector3()),
        size: box.getSize(new THREE.Vector3()),
        isAccessory: obj.name.startsWith('Handle'),
      });
    }
  });

  const empty: AvatarRig = {
    root,
    headPivot: null,
    leftShoulder: null,
    rightShoulder: null,
    leftHip: null,
    rightHip: null,
  };

  const bodyParts = parts.filter((p) => !p.isAccessory);
  if (bodyParts.length === 0) return empty;

  // Head: highest body part center.
  const head = bodyParts.reduce((a, b) => (a.center.y > b.center.y ? a : b));

  // Torso: largest-volume body part.
  const torso = bodyParts.reduce((a, b) =>
    a.size.x * a.size.y * a.size.z > b.size.x * b.size.y * b.size.z ? a : b,
  );

  const leftArmParts = bodyParts.filter(
    (p) => p !== head && p !== torso && p.center.x < torso.box.min.x + 0.02,
  );
  const rightArmParts = bodyParts.filter(
    (p) => p !== head && p !== torso && p.center.x > torso.box.max.x - 0.02,
  );

  // Legs: below the torso, narrower than it (excludes the lower-torso part).
  const armSet = new Set([...leftArmParts, ...rightArmParts]);
  const legParts = bodyParts.filter(
    (p) =>
      p !== head &&
      p !== torso &&
      !armSet.has(p) &&
      p.center.y < torso.box.min.y + 0.05 &&
      p.size.x < torso.size.x * 0.7,
  );
  const leftLegParts = legParts.filter((p) => p.center.x < torso.center.x);
  const rightLegParts = legParts.filter((p) => p.center.x >= torso.center.x);

  // Head accessories: anything overlapping the head's vertical band.
  const headAccessories = parts.filter(
    (p) => p.isAccessory && p.box.max.y > head.box.min.y,
  );

  const makePivot = (position: THREE.Vector3, members: PartInfo[]) => {
    if (members.length === 0) return null;
    const pivot = new THREE.Group();
    pivot.position.copy(position);
    root.add(pivot);
    members.forEach((p) => {
      pivot.attach(p.mesh);
    });
    return pivot;
  };

  const limbPivot = (limbParts: PartInfo[], topFraction: number) => {
    if (limbParts.length === 0) return null;
    const limbBox = limbParts.reduce(
      (acc, p) => acc.union(p.box),
      new THREE.Box3().copy(limbParts[0].box),
    );
    const c = limbBox.getCenter(new THREE.Vector3());
    const size = limbBox.getSize(new THREE.Vector3());
    return makePivot(
      new THREE.Vector3(c.x, limbBox.max.y - size.y * topFraction, c.z),
      limbParts,
    );
  };

  return {
    root,
    // Neck pivot: bottom-center of head.
    headPivot: makePivot(
      new THREE.Vector3(head.center.x, head.box.min.y, head.center.z),
      [head, ...headAccessories],
    ),
    leftShoulder: limbPivot(leftArmParts, 0.12),
    rightShoulder: limbPivot(rightArmParts, 0.12),
    leftHip: limbPivot(leftLegParts, 0.08),
    rightHip: limbPivot(rightLegParts, 0.08),
  };
}

/**
 * Wraps the rig root so the avatar stands with feet at `footY`, centered on
 * x/z, scaled to `height`, rotated by `facingY`.
 */
export function normalizeRig(
  rig: AvatarRig,
  { height, footY, facingY }: { height: number; footY: number; facingY: number },
): THREE.Group {
  const box = new THREE.Box3().setFromObject(rig.root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = height / size.y;

  const wrapper = new THREE.Group();
  wrapper.add(rig.root);
  rig.root.scale.setScalar(s);
  rig.root.rotation.y = facingY;
  rig.root.position.set(
    center.x * s * -Math.cos(facingY),
    footY - box.min.y * s,
    center.z * s * -Math.cos(facingY),
  );
  return wrapper;
}
