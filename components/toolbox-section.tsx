"use client"

import { useEffect, useRef } from "react"

import { skillGroups, type ScreenId } from "@/lib/content"
import type { createLaptopScene } from "@/lib/three/laptop-scene"

import { SectionHeading } from "./section-heading"

export function ToolboxSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const laptopRef = useRef<ReturnType<typeof createLaptopScene>>(null)
  const perchRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import("@/lib/three/laptop-scene"),
      document.fonts.ready,
    ]).then(([{ createLaptopScene }]) => {
      if (cancelled) return
      laptopRef.current = createLaptopScene(canvasRef.current!)
    })
    return () => {
      cancelled = true
      laptopRef.current?.dispose()
      laptopRef.current = null
    }
  }, [])

  useEffect(() => {
    let dispose: (() => void) | undefined
    let cancelled = false
    import("@/lib/three/perch-scene").then(({ createPerchScene }) => {
      if (cancelled) return
      dispose = createPerchScene(perchRef.current!)
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [])

  const show = (screen: ScreenId | null) => laptopRef.current?.show(screen)

  return (
    <section id="skills" className="border-t py-16 md:py-28">
      <SectionHeading title="Toolbox" className="mb-11" />
      <div className="grid items-start gap-6 md:grid-cols-2 md:gap-14 lg:grid-cols-[1fr_1fr_10rem] lg:gap-10">
        <div className="relative aspect-[1/0.82] max-w-full md:sticky md:top-24">
          <canvas
            ref={canvasRef}
            aria-label="3D laptop whose screen matches the skill group you hover. Click to open or close the lid."
            className="absolute inset-0 size-full"
          />
        </div>
        <div className="grid min-w-0" onMouseLeave={() => show(null)}>
          {skillGroups.map((group) => (
            <article
              key={group.title}
              tabIndex={0}
              onMouseEnter={() => show(group.screen)}
              onFocus={() => show(group.screen)}
              className="group relative isolate grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-3 border-b px-1 py-6 outline-none before:absolute before:-inset-x-3.5 before:inset-y-0 before:-z-10 before:rounded-[10px] before:bg-brand/12 before:opacity-0 before:transition-opacity first:border-t hover:before:opacity-100 focus-visible:before:opacity-100"
            >
              <h3 className="text-2xl font-medium tracking-tight transition-[translate,color] duration-300 group-hover:translate-x-1.5 group-hover:text-brand group-focus-visible:translate-x-1.5 group-focus-visible:text-brand">
                {group.title}
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {group.note}
              </span>
              <div className="col-span-full flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border px-2 py-1 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="relative aspect-[1/1.6] max-lg:hidden lg:sticky lg:top-24">
          <canvas
            ref={perchRef}
            aria-hidden
            className="absolute inset-0 size-full"
          />
        </div>
      </div>
    </section>
  )
}
