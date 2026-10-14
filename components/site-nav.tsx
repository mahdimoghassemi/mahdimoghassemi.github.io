import { profile } from "@/lib/content"

import { DjToggle } from "./dj-toggle"

const links = [
  { href: "#journey", label: "Journey" },
  { href: "#skills", label: "Toolbox" },
  { href: "#contact", label: "Contact" },
]

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-295 items-center justify-between gap-4 px-[clamp(16px,4vw,40px)] py-1.5">
        <a href="#top" className="text-sm font-semibold tracking-tight">
          {profile.name}
        </a>
        <div className="flex gap-7 text-sm text-muted-foreground max-md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <DjToggle />
      </div>
    </nav>
  )
}
