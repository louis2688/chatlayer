import Link from "next/link";
import { requireContext } from "@/lib/server-auth";
import { listBots } from "@/lib/bots";
import BotForm from "@/components/dash/BotForm";

export const dynamic = "force-dynamic";

export default async function BotsPage() {
  const { orgId } = await requireContext();
  const bots = await listBots(orgId);
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Bots</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Each bot proxies to its own n8n workflow.</p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {bots.map((b) => (
          <li key={b.id}>
            <Link href={`/bots/${b.id}`} className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-4 hover:border-neutral-300 dark:hover:border-neutral-700">
              <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: b.color }}>{b.name.charAt(0).toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{b.name}</span>
                <span className="block text-xs text-neutral-500">{b.isPublic ? "Public" : "Private"} &middot; {b.ratePerSession}/min</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
        <h2 className="text-lg font-semibold">New bot</h2>
        <p className="mb-4 mt-1 text-sm text-neutral-600 dark:text-neutral-400">Point it at an n8n Chat Trigger webhook.</p>
        <BotForm />
      </div>
    </div>
  );
}