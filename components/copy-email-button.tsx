"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { profile } from "@/lib/content"

export function CopyEmailButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      className={className}
      onClick={() =>
        navigator.clipboard.writeText(profile.email).then(() => setCopied(true))
      }
    >
      {copied ? "Copied" : "Copy email"}
    </Button>
  )
}
