import { redirect } from "next/navigation";

import AdminDashboard from "@/components/AdminDashboard";
import { getAuthSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <AdminDashboard />
    </div>
  );
}
