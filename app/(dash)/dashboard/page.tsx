import Link from "next/link";
import { requireContext } from "@/lib/server-auth";
import { orgStats } from "@/lib/analytics";
import { listBots } from "@/lib/bots";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-5">
      <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const { orgId, orgName } = await requireContext();
  const [stats, bots] = await Promise.all([orgStats(orgId), listBots(orgId)]);
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{orgName}</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Overview of your chat activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Bots" value={stats.bots} />
        <Stat label="Conversations" value={stats.conversations} />
        <Stat label="Messages today" value={stats.messagesToday} />
        <Stat label="Messages total" value={stats.messagesTotal} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your bots</h2>
        <Link href="/bots" className="text-sm text-emerald-400 hover:underline">Manage bots</Link>
      </div>
      {bots.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
          No bots yet. <Link href="/bots" className="text-emerald-400 hover:underline">Create your first bot</Link>.
        </div>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {bots.slice(0, 4).map((b) => (
            <li key={b.id}>
              <Link href={`/bots/${b.id}`} className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-4 hover:border-neutral-300 dark:hover:border-neutral-700">
                <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: b.color }}>{b.name.charAt(0).toUpperCase()}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{b.name}</span>
                  <span className="block text-xs text-neutral-500">{b.isPublic ? "Public" : "Private"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}