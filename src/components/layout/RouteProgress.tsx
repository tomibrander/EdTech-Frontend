"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Top progress bar reactiva al cambio de pathname.
 * Mostrar UNA vez en src/app/(app)/layout.tsx (dentro del root del shell).
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    setPhase("loading");
    const t1 = setTimeout(() => setPhase("done"), 220);
    const t2 = setTimeout(() => setPhase("idle"), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-gradient-to-r from-primary to-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.6)] transition-[transform,opacity]"
      style={{
        transform:
          phase === "loading" ? "scaleX(0.7)" : phase === "done" ? "scaleX(1)" : "scaleX(0)",
        opacity: phase === "idle" ? 0 : 1,
        transitionDuration: phase === "done" ? "250ms" : "300ms",
      }}
    />
  );
}
