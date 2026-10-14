"use client"

import { ArrowUpRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { journey } from "@/lib/content"
import { cn } from "@/lib/utils"

import { SectionHeading } from "./section-heading"

const level = (i: number) => String(i + 1).padStart(2, "0")

export function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(0)
  const chapter = journey[active]

  useEffect(() => {
    let dispose: (() => void) | undefined
    let cancelled = false
    Promise.all([
      import("@/lib/three/journey-scene"),
      document.fonts.ready,
    ]).then(([{ createJourneyScene }]) => {
      if (cancelled) return
      dispose = createJourneyScene(
        canvasRef.current!,
        sectionRef.current!,
        journey,
        setActive
      )
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [])

  const jumpTo = (i: number) => {
    const section = sectionRef.current!
    const scrollable = section.offsetHeight - window.innerHeight
    window.scrollTo({
      top: section.offsetTop + ((i + 0.2) / journey.length) * scrollable,
      behavior: "smooth",
    })
  }

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative border-t"
      style={{ height: `${journey.length * 80 + 100}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full"
        />
        <div className="pointer-events-none relative mx-auto flex h-full max-w-295 flex-col justify-between gap-6 px-[clamp(16px,4vw,40px)] pt-24 pb-8 md:pb-12">
          <SectionHeading title="The climb" />

          <div className="flex items-end justify-between gap-6">
            <article
              key={active}
              style={{ "--chapter": chapter.color } as React.CSSProperties}
              className="pointer-events-auto w-full max-w-md animate-in rounded-xl border bg-card/80 p-5 backdrop-blur-md duration-500 fade-in-0 slide-in-from-bottom-3 md:p-6"
            >
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>
                  Level {level(active)} / {level(journey.length - 1)}
                </span>
                <span className="text-(--chapter)">{chapter.years}</span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                {chapter.company}
              </h3>
              <p className="text-sm text-muted-foreground">{chapter.role}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85 max-md:text-sm">
                {chapter.story}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {chapter.domains.map((domain) => (
                  <span
                    key={domain}
                    className="rounded-md border border-(--chapter)/30 bg-(--chapter)/10 px-2 py-1 font-mono text-[11px] text-(--chapter)"
                  >
                    {domain}
                  </span>
                ))}
                {chapter.url && (
                  <a
                    href={chapter.url}
                    target="_blank"
                    rel="noopener"
                    className="ms-auto flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {new URL(chapter.url).hostname}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </div>
            </article>

            <nav
              aria-label="Career levels"
              className="pointer-events-auto flex flex-col gap-1 max-md:hidden"
            >
              {journey.map((item, i) => (
                <Button
                  key={item.company}
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  className={cn(
                    "justify-end gap-2 font-mono text-xs text-muted-foreground",
                    i === active && "text-foreground"
                  )}
                >
                  {item.company}
                  <i
                    className="size-2 rounded-full border transition-colors"
                    style={{
                      background: i <= active ? item.color : undefined,
                      borderColor: item.color,
                    }}
                  />
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <ol className="sr-only">
        {journey.map((item) => (
          <li key={item.company}>
            {item.company}, {item.role}, {item.years}. {item.story}
          </li>
        ))}
      </ol>
    </section>
  )
}
