import { requireContext } from "@/lib/server-auth";
import { recentSessions, activeSessionCount } from "@/lib/analytics";
import SessionsTable from "@/components/dash/SessionsTable";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const { orgId } = await requireContext();
  const [initial, active] = await Promise.all([recentSessions(orgId, 100), activeSessionCount(orgId)]);
  return <SessionsTable initial={initial} initialActive={active} />;
}