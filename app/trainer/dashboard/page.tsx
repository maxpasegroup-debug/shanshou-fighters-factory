import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import TrainerDashboardPanel from "@/components/TrainerDashboardPanel";

export default async function TrainerDashboardPage() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "trainer") {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
      <TrainerDashboardPanel />
    </div>
  );
}
