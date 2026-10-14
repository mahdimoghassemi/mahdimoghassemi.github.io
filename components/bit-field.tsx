"use client"

import { useEffect, useRef } from "react"

const CELL = 22
const RADIUS = 120

export function BitField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext("2d")!
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const font = `500 12px ${getComputedStyle(document.documentElement).getPropertyValue("--font-mono")}`
    const ripples: { x: number; y: number; r: number }[] = []
    const mouse = { x: -999, y: -999 }
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let bits = new Uint8Array()
    let energy = new Float32Array()
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / CELL) + 1
      rows = Math.ceil(height / CELL) + 1
      bits = Uint8Array.from({ length: cols * rows }, () =>
        Math.random() > 0.5 ? 1 : 0
      )
      energy = new Float32Array(cols * rows)
    }
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onLeave = () => {
      mouse.x = mouse.y = -999
    }
    const onDown = (e: PointerEvent) =>
      ripples.push({ x: e.clientX, y: e.clientY, r: 0 })

    const frame = () => {
      raf = requestAnimationFrame(frame)
      ctx.clearRect(0, 0, width, height)
      ctx.font = font
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      for (const ripple of ripples) ripple.r += 9
      while (ripples.length && ripples[0].r > Math.hypot(width, height))
        ripples.shift()

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i
          const x = i * CELL + CELL / 2
          const y = j * CELL + CELL / 2
          const distance = Math.hypot(x - mouse.x, y - mouse.y)
          if (distance < RADIUS)
            energy[k] = Math.max(energy[k], (1 - distance / RADIUS) * 0.55)
          for (const ripple of ripples) {
            if (
              Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - ripple.r) <
              CELL * 0.6
            ) {
              bits[k] ^= 1
              energy[k] = Math.max(energy[k], 1 - ripple.r / 900)
            }
          }
          if (!reduce && Math.random() < 0.0006) bits[k] ^= 1
          const e = energy[k]
          energy[k] *= 0.94
          ctx.fillStyle =
            e > 0.02
              ? `rgba(147,216,255,${0.07 + e * 0.8})`
              : "rgba(139,147,162,.075)"
          ctx.fillText(String(bits[k]), x, y)
        }
      }
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerdown", onDown)
    document.addEventListener("pointerleave", onLeave)
    document.fonts.ready.then(() => {
      raf = requestAnimationFrame(frame)
    })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 size-full"
    />
  )
}
