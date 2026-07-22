import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/server-auth";
import { getBot } from "@/lib/bots";
import BotForm from "@/components/dash/BotForm";
import CopyField from "@/components/dash/CopyField";
import { deleteBotAction } from "@/app/(dash)/actions";

export const dynamic = "force-dynamic";

export default async function BotEditorPage({ params }: { params: Promise<{ botId: string }> }) {
  const { orgId } = await requireContext();
  const { botId } = await params;
  const bot = await getBot(botId);
  if (!bot || bot.organizationId !== orgId) notFound();

  const snippet = `<script src="https://your-host/embed.js" data-bot="${bot.id}" data-color="${bot.color}" defer></script>`;

  return (
    <div>
      <Link href="/bots" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">&larr; Bots</Link>
      <h1 className="font-display mt-2 text-2xl font-semibold">{bot.name}</h1>

      <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
        <BotForm bot={bot} />
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
        <h2 className="text-lg font-semibold">Embed</h2>
        <p className="mb-3 mt-1 text-sm text-neutral-600 dark:text-neutral-400">Paste on any allowed site. {bot.allowAnonymous ? "" : "Visitors enter their details before the chat starts."}</p>
        <CopyField value={snippet} />
        <p className="mt-2 text-xs text-neutral-500">Direct link: <Link href={`/widget/${bot.id}`} className="text-emerald-400 hover:underline">/widget/{bot.id}</Link></p>
      </div>

      <div className="mt-6 rounded-xl border border-red-900/40 bg-red-950/20 p-6">
        <h2 className="text-lg font-semibold text-red-300">Danger zone</h2>
        <p className="mb-3 mt-1 text-sm text-neutral-600 dark:text-neutral-400">Deletes the bot and all its conversations.</p>
        <form action={deleteBotAction}>
          <input type="hidden" name="botId" value={bot.id} />
          <button type="submit" className="rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900/30">Delete bot</button>
        </form>
      </div>
    </div>
  );
}