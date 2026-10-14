import * as THREE from "three"
import { Reflector } from "three/addons/objects/Reflector.js"

import type { Chapter } from "@/lib/content"

import { beatLevel } from "@/lib/audio/music"

import { buildChibi } from "./chibi"
import { loadLogo } from "./logo-model"
import {
  bounce,
  createRenderer,
  cssFontFamily,
  disposeScene,
  prefersReducedMotion,
  radialTexture,
  runWhileVisible,
} from "./shared"

const STEP_X = 6.5
const RISE = 1.1
const WIDTH = 4.2
const DEPTH = 3.2
const FLOOR = -1.6
const STEPS = 6
const RUN = STEP_X - WIDTH

const topOf = (i: number) => i * RISE
const centerOf = (i: number) => i * STEP_X

function heightAt(i: number, x: number) {
  const along = x - (centerOf(i) + WIDTH / 2)
  if (along < 0) return topOf(i)
  if (along >= RUN) return topOf(i + 1)
  return topOf(i) + ((Math.floor(along / (RUN / STEPS)) + 1) * RISE) / STEPS
}

function labelTexture(chapter: Chapter, fonts: { sans: string; mono: string }) {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 288
  const ctx = canvas.getContext("2d")!
  ctx.font = `700 120px ${fonts.sans}`
  const width = ctx.measureText(chapter.company).width
  if (width > 970)
    ctx.font = `700 ${Math.floor((120 * 970) / width)}px ${fonts.sans}`
  ctx.fillStyle = "#e9edf3"
  ctx.fillText(chapter.company, 24, 118)
  ctx.font = `500 46px ${fonts.sans}`
  ctx.fillStyle = "#aab3c2"
  ctx.fillText(chapter.role, 28, 190)
  ctx.font = `500 36px ${fonts.mono}`
  ctx.fillStyle = chapter.color
  ctx.fillText(chapter.years, 28, 252)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

export function createJourneyScene(
  canvas: HTMLCanvasElement,
  section: HTMLElement,
  chapters: Chapter[],
  onChapter: (index: number) => void
) {
  const reduce = prefersReducedMotion()
  const fonts = {
    sans: cssFontFamily("--font-sans"),
    mono: cssFontFamily("--font-mono"),
  }
  const last = chapters.length - 1
  let disposed = false
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x0a0c10, 16, 38)
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200)
  const { renderer, dispose: disposeRenderer } = createRenderer(canvas, camera)

  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x0a0c10, 1.6))
  const sun = new THREE.DirectionalLight(0xffffff, 2.4)
  sun.position.set(6, 12, 10)
  scene.add(sun)

  const floor = new Reflector(new THREE.PlaneGeometry(400, 80), {
    color: 0x3a414c,
    textureWidth: 1024,
    textureHeight: 1024,
  })
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR
  scene.add(floor)
  const dim = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 80),
    new THREE.MeshBasicMaterial({
      color: 0x0a0c10,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    })
  )
  dim.rotation.x = -Math.PI / 2
  dim.position.y = FLOOR + 0.01
  scene.add(dim)

  const concrete = new THREE.MeshStandardMaterial({
    color: 0x1a1f27,
    roughness: 0.9,
  })
  const lip = new THREE.MeshStandardMaterial({
    color: 0x2c333e,
    roughness: 0.7,
  })
  const stair = new THREE.MeshStandardMaterial({
    color: 0x9fb6cc,
    roughness: 0.6,
  })

  const landmarks = chapters.map((chapter, i) => {
    const x = centerOf(i)
    const top = topOf(i)
    const height = top - FLOOR
    const color = new THREE.Color(chapter.color)

    const block = new THREE.Mesh(
      new THREE.BoxGeometry(WIDTH, height, DEPTH),
      concrete
    )
    block.position.set(x, FLOOR + height / 2, 0)
    scene.add(block)
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(WIDTH + 0.12, 0.12, DEPTH + 0.12),
      lip
    )
    slab.position.set(x, top - 0.06, 0)
    scene.add(slab)

    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(WIDTH * 0.9, 0.05, 0.05),
      new THREE.MeshBasicMaterial({ color })
    )
    strip.position.set(x, top - 0.28, DEPTH / 2 + 0.04)
    scene.add(strip)

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 3.9 * (288 / 1024)),
      new THREE.MeshBasicMaterial({
        map: labelTexture(chapter, fonts),
        transparent: true,
        toneMapped: false,
      })
    )
    label.position.set(x, top - 0.9, DEPTH / 2 + 0.01)
    scene.add(label)

    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      new THREE.MeshBasicMaterial({
        map: radialTexture(chapter.color),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    )
    pool.rotation.x = -Math.PI / 2
    pool.position.set(x, top + 0.01, -0.9)
    scene.add(pool)

    const landmark = new THREE.Group()
    landmark.position.set(x, top + 2.6, -0.9)
    scene.add(landmark)
    loadLogo(chapter.logo).then((logo) => {
      if (!disposed) landmark.add(logo)
    })

    if (i < last) {
      for (let k = 0; k < STEPS; k++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(RUN / STEPS + 0.02, 0.16, 1.4),
          stair
        )
        step.position.set(
          x + WIDTH / 2 + (k + 0.5) * (RUN / STEPS),
          top + ((k + 1) * RISE) / STEPS - 0.08,
          0
        )
        scene.add(step)
      }
    }
    return { landmark, pool }
  })

  const me = buildChibi()
  me.root.scale.setScalar(0.8)
  scene.add(me.root)

  let s = 0
  let y = 0
  let stride = 0
  let current = -1
  let arrivedAt: number | null = null
  const look = new THREE.Vector3()
  const desired = new THREE.Vector3()
  camera.position.set(-1.5, 3.6, 10)

  const progress = () => {
    const rect = section.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    return total > 0 ? THREE.MathUtils.clamp(-rect.top / total, 0, 1) : 0
  }

  const stop = runWhileVisible(canvas, (t) => {
    const u = progress() * chapters.length
    const k = Math.min(last, Math.floor(u))
    const walk = k < last ? THREE.MathUtils.smoothstep(u - k, 0.45, 1) : 0
    const target = k + walk
    const previous = s
    s += (target - s) * (reduce ? 1 : 0.08)
    const speed = Math.abs(s - previous)
    const moving = Math.abs(target - s) > 0.01

    const i = Math.min(Math.floor(s), Math.max(0, last - 1))
    const x = centerOf(i) + (s - i) * STEP_X
    const ground = chapters.length > 1 ? heightAt(i, x) : 0
    y += (ground - y) * (reduce ? 1 : 0.35)
    stride += speed * 45
    const swing = Math.sin(stride) * Math.min(1, speed * 60) * 0.7
    me.root.position.set(
      x,
      y + Math.abs(Math.sin(stride)) * Math.min(1, speed * 60) * 0.06,
      0.2
    )
    const facing = moving ? (target > s ? Math.PI / 2 : -Math.PI / 2) : 0
    me.root.rotation.y += (facing - me.root.rotation.y) * 0.15
    me.legs[0].rotation.x = swing
    me.legs[1].rotation.x = -swing
    me.armLeft.rotation.x = -swing * 0.8
    me.armRight.rotation.x = swing * 0.8
    const { top, bottom } = section.getBoundingClientRect()
    if (arrivedAt === null && top < window.innerHeight * 0.35) arrivedAt = t
    if (top > window.innerHeight * 0.9) arrivedAt = null
    const fall =
      reduce || s > 0.05
        ? 0
        : arrivedAt === null
          ? 1
          : 1 - bounce(THREE.MathUtils.clamp((t - arrivedAt) / 0.9, 0, 1))
    const leave = reduce
      ? 0
      : THREE.MathUtils.clamp(
          (window.innerHeight - bottom) / (window.innerHeight * 0.45),
          0,
          1
        )
    me.root.visible = fall < 1 && leave < 1
    me.root.position.y += fall * 6 + leave * leave * 7
    me.root.position.x += leave * 2.5
    me.root.rotation.z = -leave * Math.PI * 2

    const pulse = reduce ? 0 : beatLevel()
    me.body.scale.y = 1 + (reduce ? 0 : Math.sin(t * 2.2) * 0.012)
    if (!moving) me.head.rotation.x = pulse * 0.18

    landmarks.forEach(({ landmark, pool }, n) => {
      landmark.rotation.y = Math.sin(t * 0.7 + n) * 0.6
      landmark.rotation.x = Math.sin(t * 0.4 + n) * 0.12
      landmark.position.y =
        topOf(n) +
        2.6 +
        (reduce ? 0 : Math.sin(t * 1.2 + n) * 0.12) +
        pulse * 0.35
      landmark.scale.setScalar(1 + pulse * 0.08)
      pool.material.opacity = 0.55 + pulse * 0.35
    })

    const wide = camera.aspect >= 0.8
    desired.set(
      x + (wide ? -1.5 : -0.4),
      y + (wide ? 3.6 : 4.4),
      wide ? 10 : 15
    )
    camera.position.lerp(desired, reduce ? 1 : 0.06)
    look.set(x + (wide ? 1.4 : 0.6), y + 1, 0)
    camera.lookAt(look)

    const index = Math.round(s)
    if (index !== current) {
      current = index
      onChapter(index)
    }
    renderer.render(scene, camera)
  })

  return () => {
    disposed = true
    stop()
    floor.dispose()
    disposeRenderer()
    disposeScene(scene)
    renderer.dispose()
  }
}
