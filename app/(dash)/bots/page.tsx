import { requireContext } from "@/lib/server-auth";
import { listBots } from "@/lib/bots";
import BotsList from "@/components/dash/BotsList";

export const dynamic = "force-dynamic";

export default async function BotsPage() {
  const { orgId } = await requireContext();
  const bots = await listBots(orgId);
  return (
    <BotsList
      bots={bots.map((b) => ({
        id: b.id,
        name: b.name,
        color: b.color,
        allowAnonymous: b.allowAnonymous,
        ratePerSession: b.ratePerSession,
      }))}
    />
  );
}