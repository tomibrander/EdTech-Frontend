import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RouteProgress } from "@/components/layout/RouteProgress";

const PENDIENTE_PATH = "/dashboard/pendiente";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getServerSession();
  if (!user) redirect("/login");

  if (user.role === "pendiente") {
    const h = await headers();
    const path = h.get("x-pathname") ?? "";
    if (!path.startsWith(PENDIENTE_PATH)) {
      redirect(PENDIENTE_PATH);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Barra de progreso global — anima en cada cambio de pathname */}
      <RouteProgress />

      {user.role !== "pendiente" && (
        <div className="hidden lg:flex">
          <Sidebar />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <Breadcrumbs className="mb-3" />
          {children}
        </main>
      </div>
    </div>
  );
}
