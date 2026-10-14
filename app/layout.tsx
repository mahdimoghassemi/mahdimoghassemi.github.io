import type { Metadata } from "next"
import { Geist_Mono, Oxanium } from "next/font/google"

import "./globals.css"
import { profile } from "@/lib/content"
import { cn } from "@/lib/utils"

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: `${profile.name} · ${profile.role}`,
  description:
    "Software engineer building fintech and trading platforms with TypeScript, React, Next.js and WebGL.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark antialiased",
        fontMono.variable,
        "font-sans",
        oxanium.variable
      )}
    >
      <body>{children}</body>
    </html>
  )
}
