import { requireContext } from "@/lib/server-auth";
import { dailyMessages, orgStats, perBotCounts } from "@/lib/analytics";
import BarChart from "@/components/dash/BarChart";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { orgId } = await requireContext();
  const [stats, daily, perBot] = await Promise.all([orgStats(orgId), dailyMessages(orgId, 14), perBotCounts(orgId)]);
  const cards: [string, number][] = [
    ["Bots", stats.bots],
    ["Conversations", stats.conversations],
    ["Messages today", stats.messagesToday],
    ["Messages total", stats.messagesTotal],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Usage across your workspace.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-5">
            <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
        <h2 className="mb-4 text-lg font-semibold">Messages, last 14 days</h2>
        <BarChart data={daily} />
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
        <h2 className="mb-3 text-lg font-semibold">By bot</h2>
        {perBot.length === 0 ? (
          <p className="text-sm text-neutral-500">No bots yet.</p>
        ) : (
          <ul className="space-y-2">
            {perBot.map((b) => (
              <li key={b.name} className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 dark:text-neutral-300 dark:text-neutral-300">{b.name}</span>
                <span className="tabular-nums text-neutral-500">{b.n.toLocaleString()} msgs</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}