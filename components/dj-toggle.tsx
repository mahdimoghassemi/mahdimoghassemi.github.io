"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { asset } from "@/lib/asset"
import type { createTrack } from "@/lib/audio/music"
import type { createDjScene } from "@/lib/three/dj-scene"

export function DjToggle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const djRef = useRef<ReturnType<typeof createDjScene>>(null)
  const track = useRef<ReturnType<typeof createTrack>>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let cancelled = false
    import("@/lib/three/dj-scene").then(({ createDjScene }) => {
      if (cancelled) return
      djRef.current = createDjScene(canvasRef.current!)
    })
    return () => {
      cancelled = true
      djRef.current?.dispose()
      djRef.current = null
    }
  }, [])

  const toggle = async () => {
    const next = !playing
    setPlaying(next)
    djRef.current?.setPlaying(next)
    if (!next) {
      track.current?.pause()
      return
    }
    if (!track.current) {
      const { createTrack } = await import("@/lib/audio/music")
      track.current = createTrack(asset("/music/sea-breeze.mp3"))
    }
    await track.current.play()
  }

  return (
    <Button
      variant="ghost"
      size={null}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Stop the music" : "Play some music"}
      title={playing ? "Stop the music" : "Play some music"}
      className="relative h-14 w-24 overflow-hidden rounded-lg p-0 hover:bg-card"
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
      />
    </Button>
  )
}
