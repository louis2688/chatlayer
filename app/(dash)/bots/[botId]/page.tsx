import { notFound } from "next/navigation";
import { requireContext } from "@/lib/server-auth";
import { getBot } from "@/lib/bots";
import BotEditor from "@/components/dash/BotEditor";

export const dynamic = "force-dynamic";

export default async function BotEditorPage({ params }: { params: Promise<{ botId: string }> }) {
  const { orgId } = await requireContext();
  const { botId } = await params;
  const bot = await getBot(botId);
  if (!bot || bot.organizationId !== orgId) notFound();
  return <BotEditor bot={bot} />;
}