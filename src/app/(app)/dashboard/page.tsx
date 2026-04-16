import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { DASHBOARD_PATH } from "@/config/roles";

export default async function DashboardRedirectPage() {
  const { user } = await getServerSession();
  if (!user) redirect("/login");
  redirect(DASHBOARD_PATH[user.role]);
}
