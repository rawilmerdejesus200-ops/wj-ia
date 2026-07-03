import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  name?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
}

export function Avatar({ src, name, className, size = "md" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "Avatar"}
        className={cn("rounded-full object-cover", sizeMap[size], className)}
      />
    )
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground",
        sizeMap[size],
        className,
      )}
    >
      {initials}
    </div>
  )
}
