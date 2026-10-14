import * as THREE from "three"

export const ACCENT = 0x93d8ff

export function bounce(k: number) {
  const n = 7.5625
  const d = 2.75
  if (k < 1 / d) return n * k * k
  if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75
  if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375
  return n * (k -= 2.625 / d) * k + 0.984375
}

export const pointer = { x: 0, y: 0 }

if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX / window.innerWidth - 0.5
    pointer.y = e.clientY / window.innerHeight - 0.5
  })
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function cssFontFamily(variable: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

function canvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D) => void
) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  draw(canvas.getContext("2d")!)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function radialTexture(color: string) {
  return canvasTexture(128, (ctx) => {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
  })
}

export function dotTexture() {
  return canvasTexture(32, (ctx) => {
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, Math.PI * 2)
    ctx.fillStyle = "#fff"
    ctx.fill()
  })
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect()
    if (width === 0) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()
  return { renderer, dispose: () => resizeObserver.disconnect() }
}

export function runWhileVisible(
  element: Element,
  frame: (t: number) => void,
  onVisible?: (visible: boolean) => void
) {
  let visible = false
  let raf = 0
  const clock = new THREE.Timer()
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    if (!visible) return
    clock.update(now)
    frame(clock.getElapsed())
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
      onVisible?.(visible)
    },
    { threshold: 0.15 }
  )
  observer.observe(element)
  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    observer.disconnect()
  }
}

export function pickedBy(
  e: PointerEvent | MouseEvent,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  target: THREE.Object3D
) {
  const rect = canvas.getBoundingClientRect()
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    ),
    camera
  )
  return raycaster.intersectObject(target, true).length > 0
}

export function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    if (
      object instanceof THREE.Mesh ||
      object instanceof THREE.Points ||
      object instanceof THREE.Sprite
    ) {
      object.geometry.dispose()
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material]
      for (const material of materials) {
        if ("map" in material && material.map instanceof THREE.Texture)
          material.map.dispose()
        material.dispose()
      }
    }
  })
}
