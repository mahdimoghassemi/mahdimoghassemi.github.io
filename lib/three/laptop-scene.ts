import * as THREE from "three"

import type { ScreenId } from "@/lib/content"

import { CODE_LENGTH, SCREEN, SCREENS, drawCode } from "./laptop-screens"
import {
  ACCENT,
  createRenderer,
  cssFontFamily,
  disposeScene,
  pickedBy,
  pointer,
  prefersReducedMotion,
  radialTexture,
  runWhileVisible,
} from "./shared"

const CLOSED = Math.PI / 2
const OPEN = -0.22

export function createLaptopScene(canvas: HTMLCanvasElement) {
  const reduce = prefersReducedMotion()
  const fonts = {
    sans: cssFontFamily("--font-sans"),
    mono: cssFontFamily("--font-mono"),
  }
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(0, 3.1, 7.6)
  camera.lookAt(0, 0.75, 0)
  const { renderer, dispose: disposeRenderer } = createRenderer(canvas, camera)

  scene.add(new THREE.AmbientLight(0xffffff, 1.1))
  const key = new THREE.DirectionalLight(0xffffff, 2.8)
  key.position.set(3, 6, 4)
  scene.add(key)
  const rim = new THREE.DirectionalLight(ACCENT, 3)
  rim.position.set(-3, 2.5, -2.5)
  scene.add(rim)

  const metal = new THREE.MeshStandardMaterial({
    color: 0x2a303b,
    metalness: 0.7,
    roughness: 0.32,
  })
  const dark = new THREE.MeshStandardMaterial({
    color: 0x12151b,
    metalness: 0.2,
    roughness: 0.7,
  })
  const laptop = new THREE.Group()
  scene.add(laptop)
  laptop.add(new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 2.25), metal))

  const keys = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.2, 0.03, 0.2),
    dark,
    70
  )
  const matrix = new THREE.Matrix4()
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      matrix.setPosition(-1.43 + col * 0.22, 0.07, -0.9 + row * 0.22)
      keys.setMatrixAt(row * 14 + col, matrix)
    }
  }
  laptop.add(keys)
  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.01, 0.6), dark)
  trackpad.position.set(0, 0.062, 0.65)
  laptop.add(trackpad)

  const hinge = new THREE.Group()
  hinge.position.set(0, 0.06, -1.12)
  hinge.rotation.x = CLOSED
  laptop.add(hinge)
  const lid = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.07), metal)
  lid.position.y = 1.1
  hinge.add(lid)

  const screenCanvas = document.createElement("canvas")
  screenCanvas.width = SCREEN.width
  screenCanvas.height = SCREEN.height
  const ctx = screenCanvas.getContext("2d")!
  const texture = new THREE.CanvasTexture(screenCanvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.0),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
  )
  screen.position.set(0, 1.1, 0.037)
  hinge.add(screen)

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture("rgba(147,216,255,.18)"),
      depthWrite: false,
      transparent: true,
    })
  )
  glow.scale.set(7, 5, 1)
  glow.position.set(0, 1, -1.6)
  scene.add(glow)

  let lidTarget = CLOSED
  let mode: ScreenId | null = null
  let typed = 0

  const onClick = (e: MouseEvent) => {
    if (pickedBy(e, canvas, camera, laptop))
      lidTarget = lidTarget === OPEN ? CLOSED : OPEN
  }
  canvas.addEventListener("click", onClick)

  const stop = runWhileVisible(
    canvas,
    (t) => {
      hinge.rotation.x += (lidTarget - hinge.rotation.x) * (reduce ? 1 : 0.06)
      laptop.rotation.y += (-0.4 + pointer.x * 0.5 - laptop.rotation.y) * 0.05
      laptop.rotation.x += (pointer.y * 0.15 - laptop.rotation.x) * 0.05
      laptop.position.y = reduce ? 0 : Math.sin(t * 1.1) * 0.06
      if (hinge.rotation.x < 0.2 && typed < CODE_LENGTH) typed += 0.6
      if (mode && mode !== "code") SCREENS[mode](ctx, fonts, t)
      else drawCode(ctx, fonts, t, typed)
      texture.needsUpdate = true
      renderer.render(scene, camera)
    },
    (visible) => {
      if (visible) lidTarget = OPEN
    }
  )

  return {
    show(next: ScreenId | null) {
      mode = next
      if (next) lidTarget = OPEN
    },
    dispose() {
      stop()
      canvas.removeEventListener("click", onClick)
      disposeRenderer()
      disposeScene(scene)
      renderer.dispose()
    },
  }
}
