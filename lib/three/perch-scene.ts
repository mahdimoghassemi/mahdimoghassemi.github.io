import * as THREE from "three"

import { beatLevel } from "@/lib/audio/music"

import { buildChibi } from "./chibi"
import {
  ACCENT,
  bounce,
  createRenderer,
  disposeScene,
  pointer,
  prefersReducedMotion,
  radialTexture,
  runWhileVisible,
} from "./shared"

export function createPerchScene(canvas: HTMLCanvasElement) {
  const reduce = prefersReducedMotion()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 1.5, 6.2)
  camera.lookAt(0, 1.1, 0)
  const { renderer, dispose: disposeRenderer } = createRenderer(canvas, camera)

  scene.add(new THREE.HemisphereLight(0xe4eeff, 0x1a1f28, 2.2))
  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(3, 6, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(ACCENT, 2.4)
  rim.position.set(-4, 3, -4)
  scene.add(rim)

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.68, 0.12, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a1f27, roughness: 0.8 })
  )
  pad.position.y = -0.06
  scene.add(pad)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.64, 0.015, 8, 64),
    new THREE.MeshBasicMaterial({ color: ACCENT })
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.005
  scene.add(ring)
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({
      map: radialTexture("rgba(147,216,255,.55)"),
      transparent: true,
      depthWrite: false,
    })
  )
  glow.rotation.x = -Math.PI / 2
  glow.position.y = 0.01
  scene.add(glow)

  const me = buildChibi()
  me.root.rotation.y = -0.35
  scene.add(me.root)

  let arrivedAt: number | null = null
  let blinkAt = 2
  let blinkEnd = 0

  const stop = runWhileVisible(canvas, (t) => {
    const top = canvas.getBoundingClientRect().top
    if (arrivedAt === null && top < window.innerHeight * 0.7) arrivedAt = t
    if (top > window.innerHeight) arrivedAt = null
    const fall = reduce
      ? 0
      : arrivedAt === null
        ? 1
        : 1 - bounce(THREE.MathUtils.clamp((t - arrivedAt) / 0.9, 0, 1))
    const since = arrivedAt === null ? 0 : t - arrivedAt
    const pulse = reduce ? 0 : beatLevel()

    me.root.visible = fall < 1
    me.root.position.y = fall * 6
    me.root.rotation.y += (-0.35 + pointer.x * 0.4 - me.root.rotation.y) * 0.05
    me.head.rotation.y += (pointer.x * 0.5 - me.head.rotation.y) * 0.08
    me.head.rotation.x +=
      (pointer.y * 0.3 + pulse * 0.18 - me.head.rotation.x) * 0.15
    me.body.scale.y = 1 + (reduce ? 0 : Math.sin(t * 2.2) * 0.012)

    const waving = !reduce && since > 1 && (since - 1) % 6 < 1.8
    const armTarget = waving ? -2.55 + Math.sin(t * 11) * 0.28 : -0.12
    me.armRight.rotation.z += (armTarget - me.armRight.rotation.z) * 0.18
    me.armLeft.rotation.z = 0.12 + Math.sin(t * 1.6) * 0.03

    if (t > blinkAt) {
      blinkEnd = t + 0.12
      blinkAt = t + 2.5 + Math.random() * 3
    }
    for (const eye of me.eyes) eye.scale.y = t < blinkEnd ? 0.12 : 1

    glow.material.opacity = 0.7 + pulse * 0.3
    renderer.render(scene, camera)
  })

  return () => {
    stop()
    disposeRenderer()
    disposeScene(scene)
    renderer.dispose()
  }
}
