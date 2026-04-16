import { tenantConfig } from "@/config/tenant.config";
import { TenantLogo } from "@/components/layout/TenantLogo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <TenantLogo className="h-7" />
          <p className="text-xs text-muted-foreground">{tenantConfig.name}</p>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t py-6 text-center text-xs text-muted-foreground">
        {tenantConfig.textos.footerNote}
      </footer>
    </div>
  );
}
