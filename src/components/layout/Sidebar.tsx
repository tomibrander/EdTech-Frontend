"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { filterNavByRole, getNavSections } from "@/config/nav";
import { useSession } from "@/features/auth/useSession";
import { TenantLogo } from "./TenantLogo";
import { tenantConfig } from "@/config/tenant.config";

interface Props {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cuando la URL ya cambió, soltamos el pending.
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const sections =
    mounted && role ? filterNavByRole(getNavSections(), role) : [];

  const handleClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (href === pathname) return;
      e.preventDefault();
      setPendingHref(href);
      startTransition(() => {
        router.push(href);
        onNavigate?.();
      });
    };

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-background",
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <TenantLogo className="h-7" />
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const loading = pendingHref === item.href && isPending;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      onMouseEnter={() => router.prefetch(item.href)}
                      onClick={handleClick(item.href)}
                      className={cn(
                        "group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground/70 hover:bg-accent/60 hover:text-foreground",
                        loading && "scale-[0.98] opacity-80"
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute -left-1 top-2 bottom-2 w-[3px] rounded-full bg-primary"
                        />
                      )}
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{tenantConfig.name}</p>
        <p className="mt-0.5">{tenantConfig.supportEmail}</p>
      </div>
    </aside>
  );
}
