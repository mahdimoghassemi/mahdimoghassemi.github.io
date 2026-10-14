import * as THREE from "three"

import { beatLevel } from "@/lib/audio/music"

import { buildChibi } from "./chibi"
import {
  ACCENT,
  createRenderer,
  disposeScene,
  prefersReducedMotion,
} from "./shared"

function headphones() {
  const band = new THREE.MeshToonMaterial({ color: ACCENT })
  const cup = new THREE.MeshToonMaterial({ color: 0x1b1d24 })
  const group = new THREE.Group()
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.05, 10, 40, Math.PI),
    band
  )
  arc.position.y = 0.04
  group.add(arc)
  for (const s of [-1, 1]) {
    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.12, 24),
      cup
    )
    shell.rotation.z = Math.PI / 2
    shell.position.set(s * 0.56, 0, 0)
    group.add(shell)
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.13, 24),
      band
    )
    pad.rotation.z = Math.PI / 2
    pad.position.set(s * 0.6, 0, 0)
    group.add(pad)
  }
  return group
}

function decks() {
  const group = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.28, 0.75),
    new THREE.MeshToonMaterial({ color: 0x2a2f3a })
  )
  group.add(body)
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.03, 0.02),
    new THREE.MeshBasicMaterial({ color: ACCENT })
  )
  strip.position.set(0, 0, 0.38)
  group.add(strip)
  const records = [-1, 1].map((s) => {
    const record = new THREE.Group()
    record.position.set(s * 0.45, 0.16, 0)
    record.add(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.03, 32),
        new THREE.MeshToonMaterial({ color: 0x0d0e12 })
      )
    )
    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.035, 20),
      new THREE.MeshToonMaterial({ color: ACCENT })
    )
    label.position.x = 0.03
    record.add(label)
    group.add(record)
    return record
  })
  return { group, records }
}

export function createDjScene(canvas: HTMLCanvasElement) {
  const reduce = prefersReducedMotion()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)
  camera.position.set(0, 1.75, 3.6)
  camera.lookAt(0, 1.4, 0)
  const { renderer, dispose: disposeRenderer } = createRenderer(canvas, camera)

  scene.add(new THREE.HemisphereLight(0xe4eeff, 0x1a1f28, 2.2))
  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(2, 4, 5)
  scene.add(key)

  const me = buildChibi()
  me.head.add(headphones())
  scene.add(me.root)
  const deck = decks()
  deck.group.position.set(0, 1.0, 0.62)
  scene.add(deck.group)

  let playing = false
  let raf = 0
  let blinkAt = 2
  let blinkEnd = 0
  const clock = new THREE.Timer()

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    clock.update(now)
    const t = clock.getElapsed()
    const pulse = reduce ? 0 : beatLevel()
    const on = playing ? 1 : 0

    me.root.position.y = -pulse * 0.06 * on
    me.head.rotation.x +=
      ((playing ? 0.12 + pulse * 0.3 : 0.32) - me.head.rotation.x) * 0.2
    me.head.rotation.z = playing && !reduce ? Math.sin(t * 2) * 0.08 : 0
    me.armRight.rotation.x +=
      ((playing ? -1.5 : -1.2) - me.armRight.rotation.x) * 0.15
    me.armLeft.rotation.x +=
      ((playing ? -1.5 : -1.2) - me.armLeft.rotation.x) * 0.15
    me.armRight.rotation.y = playing && !reduce ? Math.sin(t * 9) * 0.35 : 0
    me.armLeft.rotation.z = 0.12 + (playing ? pulse * 0.25 : 0)
    for (const [i, record] of deck.records.entries()) {
      record.rotation.y += playing && !reduce ? 0.08 + i * 0.02 : 0
    }

    if (playing && t > blinkAt) {
      blinkEnd = t + 0.12
      blinkAt = t + 2.5 + Math.random() * 3
    }
    for (const eye of me.eyes) eye.scale.y = !playing || t < blinkEnd ? 0.12 : 1

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  return {
    setPlaying(next: boolean) {
      playing = next
    },
    dispose() {
      cancelAnimationFrame(raf)
      disposeRenderer()
      disposeScene(scene)
      renderer.dispose()
    },
  }
}
