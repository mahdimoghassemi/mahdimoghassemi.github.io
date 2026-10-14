"use client"

import { useEffect, useRef, useState } from "react"

import { profile } from "@/lib/content"

export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [time, setTime] = useState("--:--")

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: profile.timeZone,
      hour: "2-digit",
      minute: "2-digit",
    })
    const tick = () => setTime(format.format(new Date()))
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let dispose: (() => void) | undefined
    let cancelled = false
    import("@/lib/three/globe-scene").then(({ createGlobeScene }) => {
      if (cancelled) return
      dispose = createGlobeScene(canvasRef.current!, labelRef.current!)
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [])

  return (
    <div className="relative aspect-square max-w-full">
      <canvas
        ref={canvasRef}
        aria-label="A small 3D version of me standing on a dotted globe, on the UAE. Drag to spin the globe, click me to jump."
        className="absolute inset-0 size-full cursor-grab touch-pan-y active:cursor-grabbing"
      />
      <span
        ref={labelRef}
        className="pointer-events-none absolute top-0 left-0 flex items-center gap-2 rounded-full border bg-card/85 px-3 py-2 font-mono text-xs whitespace-nowrap opacity-0 transition-opacity duration-500 before:absolute before:top-1/2 before:right-full before:h-px before:w-14 before:bg-linear-to-r before:from-transparent before:to-brand"
      >
        <i className="size-1.75 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
        Based in {profile.location} ·{" "}
        <b className="font-medium text-brand tabular-nums">{time} GST</b>
      </span>
    </div>
  )
}
