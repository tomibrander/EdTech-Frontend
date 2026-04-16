import type { Metadata } from "next";
import "./globals.css";
import { tenantConfig, tenantCssVariables } from "@/config/tenant.config";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: tenantConfig.name,
    template: `%s · ${tenantConfig.shortName}`,
  },
  description: tenantConfig.textos.heroLine,
  icons: { icon: tenantConfig.favicon },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <style
          // eslint-disable-next-line react/no-unknown-property
          dangerouslySetInnerHTML={{
            __html: `:root{${tenantCssVariables()}}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
