import * as THREE from "three"

const COLORS = {
  skin: 0xd2a283,
  skinShade: 0xb8876a,
  hair: 0x141313,
  fade: 0x3d322c,
  beard: 0x2a211c,
  shirt: 0x1d1e24,
  pants: 0x2b2e36,
  shoe: 0xf0f0f0,
  sole: 0xb9bec6,
  button: 0xf4f4f4,
  strap: 0x1f4a38,
  mouth: 0x6b3f33,
}

function toonGradient() {
  const canvas = document.createElement("canvas")
  canvas.width = 4
  canvas.height = 1
  const ctx = canvas.getContext("2d")!
  ;["#4a4a4a", "#9a9a9a", "#dcdcdc", "#ffffff"].forEach((color, i) => {
    ctx.fillStyle = color
    ctx.fillRect(i, 0, 1, 1)
  })
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  return texture
}

export function buildChibi() {
  const gradientMap = toonGradient()
  const toon = (color: number, extra: THREE.MeshToonMaterialParameters = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap, ...extra })
  const m = {
    skin: toon(COLORS.skin),
    skinShade: toon(COLORS.skinShade),
    hair: toon(COLORS.hair),
    fade: toon(COLORS.fade),
    beard: toon(COLORS.beard, { transparent: true, opacity: 0.78 }),
    shirt: toon(COLORS.shirt),
    pants: toon(COLORS.pants),
    shoe: toon(COLORS.shoe),
    sole: toon(COLORS.sole),
    button: toon(COLORS.button),
    strap: toon(COLORS.strap),
    mouth: toon(COLORS.mouth),
    steel: new THREE.MeshStandardMaterial({
      color: 0xc9ced6,
      metalness: 0.8,
      roughness: 0.25,
    }),
    frame: new THREE.MeshStandardMaterial({
      color: 0xd9d3c9,
      metalness: 0.6,
      roughness: 0.3,
    }),
    lens: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    }),
    eye: new THREE.MeshBasicMaterial({ color: 0x111111 }),
    shine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  }
  const add = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x = 0,
    y = 0,
    z = 0
  ) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    parent.add(mesh)
    return mesh
  }

  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)

  const legs = [-1, 1].map((s) => {
    const hip = new THREE.Group()
    hip.position.set(s * 0.13, 0.62, 0)
    body.add(hip)
    add(
      hip,
      new THREE.SphereGeometry(0.14, 20, 14),
      m.shoe,
      s * 0.01,
      -0.54,
      0.05
    ).scale.set(1, 0.62, 1.45)
    add(
      hip,
      new THREE.CylinderGeometry(0.14, 0.14, 0.03, 20),
      m.sole,
      s * 0.01,
      -0.6,
      0.05
    ).scale.set(1, 1, 1.45)
    add(hip, new THREE.CapsuleGeometry(0.1, 0.32, 6, 14), m.pants, 0, -0.24, 0)
    return hip
  })
  add(
    body,
    new THREE.CapsuleGeometry(0.3, 0.32, 8, 20),
    m.shirt,
    0,
    0.94,
    0
  ).scale.set(1.05, 1, 0.8)
  for (let i = 0; i < 4; i++) {
    add(
      body,
      new THREE.SphereGeometry(0.022, 8, 8),
      m.button,
      0,
      0.79 + i * 0.1,
      0.245
    )
  }

  const arm = (s: number) => {
    const shoulder = new THREE.Group()
    shoulder.position.set(s * 0.33, 1.17, 0)
    shoulder.rotation.z = s * 0.12
    body.add(shoulder)
    add(
      shoulder,
      new THREE.CapsuleGeometry(0.085, 0.18, 6, 12),
      m.shirt,
      0,
      -0.15,
      0
    )
    add(
      shoulder,
      new THREE.TorusGeometry(0.085, 0.032, 8, 16),
      m.shirt,
      0,
      -0.29,
      0
    ).rotation.x = Math.PI / 2
    add(
      shoulder,
      new THREE.CapsuleGeometry(0.068, 0.16, 6, 12),
      m.skin,
      0,
      -0.42,
      0
    )
    add(shoulder, new THREE.SphereGeometry(0.085, 14, 12), m.skin, 0, -0.57, 0)
    return shoulder
  }
  const armLeft = arm(1)
  const armRight = arm(-1)
  add(
    armLeft,
    new THREE.TorusGeometry(0.07, 0.022, 8, 16),
    m.strap,
    0,
    -0.49,
    0
  ).rotation.x = Math.PI / 2
  add(
    armLeft,
    new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16),
    m.steel,
    0,
    -0.49,
    0.078
  ).rotation.x = Math.PI / 2

  const head = new THREE.Group()
  head.position.y = 1.7
  head.scale.set(1, 1.02, 0.95)
  body.add(head)
  add(head, new THREE.SphereGeometry(0.5, 32, 24), m.skin)
  for (const s of [-1, 1]) {
    add(
      head,
      new THREE.SphereGeometry(0.09, 12, 10),
      m.skin,
      s * 0.49,
      -0.03,
      0
    ).scale.set(0.5, 1, 0.8)
  }
  add(
    head,
    new THREE.SphereGeometry(
      0.506,
      32,
      16,
      Math.PI / 2 + 0.95,
      Math.PI * 2 - 1.9,
      0,
      1.75
    ),
    m.fade
  )
  add(
    head,
    new THREE.SphereGeometry(0.53, 32, 16, 0, Math.PI * 2, 0, 1.12),
    m.hair,
    0,
    0.02,
    -0.01
  )
  for (const [x, y, z, r] of [
    [0, 0.44, 0.2, 0.2],
    [-0.16, 0.42, 0.15, 0.17],
    [0.15, 0.43, 0.13, 0.16],
    [0, 0.5, 0, 0.21],
    [0.06, 0.47, 0.26, 0.12],
  ]) {
    add(head, new THREE.SphereGeometry(r, 16, 12), m.hair, x, y, z).scale.y =
      0.7
  }
  add(
    head,
    new THREE.SphereGeometry(0.513, 32, 16, Math.PI / 2 - 1.5, 3, 1.78, 1.1),
    m.beard
  )
  add(
    head,
    new THREE.CapsuleGeometry(0.02, 0.15, 4, 8),
    m.beard,
    0,
    -0.16,
    0.48
  ).rotation.z = Math.PI / 2
  add(
    head,
    new THREE.CapsuleGeometry(0.012, 0.07, 4, 8),
    m.mouth,
    0,
    -0.24,
    0.46
  ).rotation.z = Math.PI / 2
  add(
    head,
    new THREE.SphereGeometry(0.05, 12, 10),
    m.skinShade,
    0,
    -0.07,
    0.49
  ).scale.set(1, 0.9, 0.8)

  const eyes = [-1, 1].map((s) => {
    const eye = new THREE.Group()
    eye.position.set(s * 0.17, 0.02, 0.465)
    head.add(eye)
    add(eye, new THREE.SphereGeometry(0.055, 14, 12), m.eye).scale.set(
      1,
      1.25,
      0.5
    )
    add(
      eye,
      new THREE.SphereGeometry(0.015, 8, 8),
      m.shine,
      s * -0.018,
      0.025,
      0.024
    )
    add(
      head,
      new THREE.BoxGeometry(0.17, 0.045, 0.04),
      m.hair,
      s * 0.17,
      0.155,
      0.46
    ).rotation.z = s * -0.08
    return eye
  })

  for (const s of [-1, 1]) {
    add(
      head,
      new THREE.TorusGeometry(0.125, 0.016, 8, 32),
      m.frame,
      s * 0.18,
      0.02,
      0.53
    ).scale.set(1.08, 0.95, 1)
    add(
      head,
      new THREE.CircleGeometry(0.125, 32),
      m.lens,
      s * 0.18,
      0.02,
      0.526
    ).scale.set(1.08, 0.95, 1)
    add(
      head,
      new THREE.BoxGeometry(0.018, 0.018, 0.56),
      m.frame,
      s * 0.4,
      0.04,
      0.265
    ).rotation.y = -s * 0.33
  }
  add(
    head,
    new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8),
    m.frame,
    0,
    0.06,
    0.55
  ).rotation.z = Math.PI / 2

  return { root, body, head, armLeft, armRight, legs, eyes }
}
