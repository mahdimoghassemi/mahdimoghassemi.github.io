import { cn } from "@/lib/utils"

export function SectionHeading({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  return (
    <h2
      className={cn(
        "text-[clamp(28px,3.6vw,44px)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance",
        className
      )}
    >
      {title}
    </h2>
  )
}
