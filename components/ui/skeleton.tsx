import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // Heavy mode enabled by default (matches previous toggle setting)
  const heavyMode = true;

  return (
    <div
      className={cn(
        "rounded-md",
        heavyMode
          ? "animate-shine bg-[linear-gradient(110deg,transparent_25%,hsl(var(--primary-glow))_50%,transparent_75%)] bg-[length:200%_100%]"
          : "animate-pulse bg-muted",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton }

