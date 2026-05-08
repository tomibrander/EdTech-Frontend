"use client";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  label: string;
  /**
   * Cuando es número, se anima con count-up; cuando es string, se muestra tal cual.
   * Esto permite mantener la API previa (pasar "—" cuando aún no hay data).
   */
  value: number | string;
  /** Sufijo aplicado SOLO si value es número (ej "%"). */
  suffix?: string;
  /** Decimales aplicados SOLO si value es número. */
  decimals?: number;
  /** Variación numérica para mostrar el chip de delta. */
  delta?: number;
  /** Cuando true, un delta negativo se considera positivo (ej moras bajan). */
  invertDelta?: boolean;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  delta,
  invertDelta = false,
  hint,
  icon: Icon,
  className,
}: Props) {
  const positive =
    delta != null && (invertDelta ? delta < 0 : delta > 0);

  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>

        <div className="mt-2 font-serif text-3xl tracking-tight">
          {typeof value === "number" ? (
            <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
          ) : (
            <span>{value}</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta != null && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                positive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(delta)}
              {suffix === "%" ? "pp" : ""}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
