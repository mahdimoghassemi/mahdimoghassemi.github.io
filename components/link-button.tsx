import { Button } from "@/components/ui/button"

export const actionClassName = "h-10 gap-2 px-4"

export function LinkButton({
  href,
  variant = "outline",
  children,
}: {
  href: string
  variant?: "default" | "outline"
  children: React.ReactNode
}) {
  const external = href.startsWith("http")
  return (
    <Button
      variant={variant}
      nativeButton={false}
      className={actionClassName}
      render={
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener" : undefined}
        />
      }
    >
      {children}
    </Button>
  )
}
