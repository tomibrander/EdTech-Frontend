import { tenantConfig } from "@/config/tenant.config";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "light" | "dark";
  wordmark?: boolean;
}

export function TenantLogo({ className, variant = "light" }: Props) {
  const src = variant === "dark" ? tenantConfig.logo.dark : tenantConfig.logo.light;
  return (
    <img
      src={src}
      alt={tenantConfig.name}
      className={cn("h-8 w-auto text-primary", className)}
      style={{ color: "hsl(var(--primary))" }}
    />
  );
}
