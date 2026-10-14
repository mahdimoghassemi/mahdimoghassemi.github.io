import { geoContains, geoEquirectangular, geoPath } from "d3-geo"
import * as THREE from "three"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"
import countries from "world-atlas/countries-110m.json"

import { buildChibi } from "./chibi"
import {
  ACCENT,
  bounce,
  createRenderer,
  disposeScene,
  dotTexture,
  pickedBy,
  pointer,
  prefersReducedMotion,
  radialTexture,
  runWhileVisible,
} from "./shared"

const RADIUS = 2.2
const HOME = { name: "United Arab Emirates", lat: 24.3, lon: 54.4 }
const MASK = { width: 1024, height: 512 }

const toVector = (lat: number, lon: number, r = RADIUS) => {
  const p = THREE.MathUtils.degToRad(lat)
  const l = THREE.MathUtils.degToRad(lon)
  return new THREE.Vector3(
    r * Math.cos(p) * Math.sin(l),
    r * Math.sin(p),
    r * Math.cos(p) * Math.cos(l)
  )
}

function worldDots() {
  const topology = countries as unknown as Topology<{
    countries: GeometryCollection<{ name: string }>
  }>
  const world = feature(topology, topology.objects.countries)

  const canvas = document.createElement("canvas")
  canvas.width = MASK.width
  canvas.height = MASK.height
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!
  const projection = geoEquirectangular()
    .scale(MASK.width / (2 * Math.PI))
    .translate([MASK.width / 2, MASK.height / 2])
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  geoPath(projection, ctx)(world)
  ctx.fill()
  const mask = ctx.getImageData(0, 0, MASK.width, MASK.height).data
  const isLand = (lat: number, lon: number) => {
    const x = Math.floor(((lon + 180) / 360) * MASK.width)
    const y = Math.floor(((90 - lat) / 180) * MASK.height)
    return mask[(y * MASK.width + x) * 4 + 3] > 100
  }

  const land: number[] = []
  const count = 20000
  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = i * 2.39996323
    const x = Math.cos(theta) * r
    const z = Math.sin(theta) * r
    const lat = THREE.MathUtils.radToDeg(Math.asin(y))
    const lon = THREE.MathUtils.radToDeg(Math.atan2(x, z))
    if (isLand(lat, lon)) land.push(x * RADIUS, y * RADIUS, z * RADIUS)
  }

  const home: number[] = []
  const homeShape = world.features.find((f) => f.properties.name === HOME.name)
  if (homeShape) {
    for (let lat = HOME.lat - 2; lat < HOME.lat + 2.2; lat += 0.13) {
      for (let lon = HOME.lon - 3; lon < HOME.lon + 2.4; lon += 0.13) {
        if (geoContains(homeShape, [lon, lat]))
          home.push(...toVector(lat, lon, RADIUS * 1.004).toArray())
      }
    }
  }
  return { land, home }
}

export function createGlobeScene(
  canvas: HTMLCanvasElement,
  label: HTMLElement
) {
  const reduce = prefersReducedMotion()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 4.3, 8.6)
  camera.lookAt(0, 1.45, 0)
  const { renderer, dispose: disposeRenderer } = createRenderer(canvas, camera)

  scene.add(new THREE.HemisphereLight(0xe4eeff, 0x1a1f28, 2.2))
  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(3, 6, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(ACCENT, 2.4)
  rim.position.set(-4, 3, -4)
  scene.add(rim)

  const outer = new THREE.Group()
  const inner = new THREE.Group()
  outer.add(inner)
  scene.add(outer)
  inner.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 0.992, 64, 48),
      new THREE.MeshBasicMaterial({ color: 0x0d1118 })
    )
  )
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture("rgba(147,216,255,.2)"),
      depthWrite: false,
      transparent: true,
    })
  )
  halo.scale.setScalar(RADIUS * 3.2)
  halo.position.set(0, 0, -1)
  scene.add(halo)

  const dots = dotTexture()
  const points = (
    positions: number[],
    color: number,
    size: number,
    opacity: number
  ) => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    )
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color,
        size,
        map: dots,
        transparent: true,
        opacity,
        depthWrite: false,
      })
    )
  }
  const { land, home } = worldDots()
  inner.add(points(land, 0x5d6779, 0.045, 0.9))
  inner.add(points(home, ACCENT, 0.055, 1))

  const homeDirection = toVector(HOME.lat, HOME.lon, 1)
  const spot = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture("rgba(147,216,255,.9)"),
      depthWrite: false,
      transparent: true,
    })
  )
  spot.position.copy(homeDirection).multiplyScalar(RADIUS * 1.02)
  spot.scale.setScalar(0.55)
  inner.add(spot)

  const ringGroup = new THREE.Group()
  ringGroup.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    homeDirection
  )
  inner.add(ringGroup)
  const rings = [0, 1, 2].map(() => {
    const holder = new THREE.Group()
    const material = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      depthWrite: false,
    })
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.012, 6, 72),
      material
    )
    ring.rotation.x = Math.PI / 2
    holder.add(ring)
    ringGroup.add(holder)
    return { holder, material }
  })

  const me = buildChibi()
  me.root.scale.setScalar(0.6)
  scene.add(me.root)
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 32),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = RADIUS + 0.012
  scene.add(shadow)

  const target = new THREE.Vector3(0, Math.cos(0.17), Math.sin(0.17))
  const settled = new THREE.Quaternion().setFromUnitVectors(
    homeDirection,
    target
  )
  const start = new THREE.Quaternion()
    .setFromEuler(new THREE.Euler(-0.9, 2.6, 0.3))
    .multiply(settled)

  let spin = 0
  let velocity = 0
  let drag: { x: number; moved: number } | null = null
  let now = 0
  let jumpAt = -9
  let blinkAt = 2
  let blinkEnd = 0

  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, moved: 0 }
    canvas.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (!drag) return
    const dx = e.clientX - drag.x
    drag.x = e.clientX
    drag.moved += Math.abs(dx)
    velocity = dx * 0.008
    spin += velocity
  }
  const onUp = (e: PointerEvent) => {
    if (drag && drag.moved < 4 && pickedBy(e, canvas, camera, me.root))
      jumpAt = now
    drag = null
  }
  canvas.addEventListener("pointerdown", onDown)
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerup", onUp)

  const world = new THREE.Vector3()
  const toCamera = new THREE.Vector3()

  const stop = runWhileVisible(canvas, (t) => {
    now = t
    const intro = reduce ? 1 : Math.min(1, t / 2.4)
    inner.quaternion.slerpQuaternions(
      start,
      settled,
      1 - Math.pow(1 - intro, 3)
    )

    if (!drag) {
      velocity *= 0.92
      spin += velocity
      spin -= spin * 0.035
    }
    outer.rotation.y = spin + (reduce ? 0 : Math.sin(t * 0.4) * 0.06)

    const landed = reduce ? 1 : THREE.MathUtils.clamp((t - 1.5) / 0.9, 0, 1)
    const jump =
      t - jumpAt < 0.55 ? Math.sin((Math.PI * (t - jumpAt)) / 0.55) * 0.55 : 0
    const drop = (1 - bounce(landed)) * 3.2
    const box = canvas.getBoundingClientRect()
    const leave = reduce
      ? 0
      : THREE.MathUtils.clamp(-box.top / (box.height * 0.6), 0, 1)
    me.root.visible = landed > 0 && leave < 1
    me.root.position.y = RADIUS - 0.03 + drop + jump + leave * leave * 6
    me.root.rotation.x = leave * Math.PI * 2
    me.root.rotation.y += (pointer.x * 0.5 - me.root.rotation.y) * 0.05
    shadow.scale.setScalar(
      landed > 0 ? Math.max(0, 1 - (drop + jump + leave * 6) * 0.35) : 0
    )

    me.head.rotation.y += (pointer.x * 0.5 - me.head.rotation.y) * 0.08
    me.head.rotation.x += (pointer.y * 0.3 - me.head.rotation.x) * 0.08
    me.body.scale.y = 1 + (reduce ? 0 : Math.sin(t * 2.2) * 0.012)
    const waving = !reduce && t > 2.4 && (t - 2.4) % 7 < 1.9
    const armTarget = waving ? -2.55 + Math.sin(t * 11) * 0.28 : -0.12
    me.armRight.rotation.z += (armTarget - me.armRight.rotation.z) * 0.18
    me.armLeft.rotation.z = 0.12 + Math.sin(t * 1.6) * 0.03
    if (t > blinkAt) {
      blinkEnd = t + 0.12
      blinkAt = t + 2.5 + Math.random() * 3
    }
    for (const eye of me.eyes) eye.scale.y = t < blinkEnd ? 0.12 : 1

    rings.forEach(({ holder, material }, i) => {
      const phase = ((t - 2.4) * 0.45 + i / 3) % 1
      const angle = 0.04 + Math.abs(phase) * 0.32
      holder.position.y = RADIUS * Math.cos(angle) + 0.01
      holder.scale.set(RADIUS * Math.sin(angle), 1, RADIUS * Math.sin(angle))
      material.opacity =
        landed === 1 && !reduce ? (1 - Math.abs(phase)) * 0.8 : 0
    })

    spot.getWorldPosition(world)
    toCamera.copy(camera.position).sub(world).normalize()
    const facing = world.clone().normalize().dot(toCamera) > 0.1
    world.project(camera)
    const rect = canvas.getBoundingClientRect()
    label.style.transform = `translate(${((world.x + 1) / 2) * rect.width + 70}px, ${((1 - world.y) / 2) * rect.height - 16}px)`
    label.style.opacity = facing && intro === 1 ? "1" : "0"

    renderer.render(scene, camera)
  })

  return () => {
    stop()
    canvas.removeEventListener("pointerdown", onDown)
    canvas.removeEventListener("pointermove", onMove)
    canvas.removeEventListener("pointerup", onUp)
    disposeRenderer()
    disposeScene(scene)
    renderer.dispose()
  }
}
