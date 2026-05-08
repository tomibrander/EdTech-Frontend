import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader con título serif (Newsreader) y eyebrow opcional en accent-deep.
 * Reemplaza al PageHeader anterior — la API es compatible, solo agrega `eyebrow`.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
