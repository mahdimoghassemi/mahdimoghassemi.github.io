import { BitField } from "@/components/bit-field"
import { CopyEmailButton } from "@/components/copy-email-button"
import { HeroGlobe } from "@/components/hero-globe"
import { JourneySection } from "@/components/journey-section"
import { LinkButton, actionClassName } from "@/components/link-button"
import { SectionHeading } from "@/components/section-heading"
import { SiteNav } from "@/components/site-nav"
import { ToolboxSection } from "@/components/toolbox-section"
import { profile } from "@/lib/content"

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-xs font-medium tracking-[0.06em] text-brand before:h-px before:w-5.5 before:bg-brand">
      {children}
    </div>
  )
}

const gutter = "mx-auto max-w-295 px-[clamp(16px,4vw,40px)]"

export default function Page() {
  return (
    <>
      <BitField />
      <SiteNav />
      <main id="top" className="relative z-1">
        <div className={gutter}>
          <div className="grid items-center gap-6 pt-9 pb-8 md:grid-cols-[1fr_1.05fr] md:pt-[clamp(40px,7vw,90px)]">
            <div className="min-w-0">
              <Eyebrow>
                {profile.role.toLowerCase()} · {profile.location.toLowerCase()}
              </Eyebrow>
              <h1 className="my-5.5 text-[clamp(40px,6vw,76px)] leading-[0.98] font-semibold tracking-[-0.04em] text-balance">
                I build software that feels{" "}
                <span className="text-brand">instant.</span>
              </h1>
              <p className="mb-8.5 max-w-[46ch] text-lg text-muted-foreground">
                I&apos;m {profile.name}. Five years of shipping software, mostly
                fintech and trading, four products built from zero, and lately,
                software that thinks back.
              </p>
              <div className="flex flex-wrap gap-3">
                <LinkButton href="#journey" variant="default">
                  Follow the climb <span aria-hidden>↓</span>
                </LinkButton>
                <LinkButton href="#contact">Get in touch</LinkButton>
              </div>
            </div>
            <div className="min-w-0">
              <HeroGlobe />
            </div>
          </div>
        </div>

        <JourneySection />

        <div className={gutter}>
          <ToolboxSection />

          <section id="contact" className="border-t py-16 md:py-28">
            <Eyebrow>say hello</Eyebrow>
            <SectionHeading
              title="Got something worth building?"
              className="mt-4.5"
            />
            <span className="my-7 block text-[clamp(22px,3vw,34px)] font-medium break-all text-muted-foreground transition-colors select-all hover:text-brand">
              {profile.email}
            </span>
            <div className="flex flex-wrap gap-3">
              <CopyEmailButton className={actionClassName} />
              {profile.links.map((link) => (
                <LinkButton key={link.label} href={link.href}>
                  {link.label} ↗
                </LinkButton>
              ))}
            </div>
          </section>

          <footer className="flex flex-wrap justify-between gap-3 border-t py-7 font-mono text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <span>
              built with next.js, three.js and a pair programmer that never
              sleeps · music: “Sea Breeze” by Roa
            </span>
          </footer>
        </div>
      </main>
    </>
  )
}
