"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  /** Decimales a mostrar. Default 0. */
  decimals?: number;
  /** Sufijo (ej "%"). */
  suffix?: string;
  /** Duración del count-up en ms. */
  duration?: number;
  /** Locale para el `toLocaleString`. */
  locale?: string;
  className?: string;
}

/**
 * Cuenta animadamente desde el valor anterior hasta `value` con ease-out cubic.
 * Usar dentro de StatCard u otros displays numéricos.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  duration = 900,
  locale = "es-AR",
  className,
}: Props) {
  const [n, setN] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = n;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(fromRef.current + (value - fromRef.current) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = decimals
    ? n.toFixed(decimals)
    : Math.round(n).toLocaleString(locale);

  return (
    <span className={"num-mono " + (className ?? "")}>
      {formatted}
      {suffix}
    </span>
  );
}
