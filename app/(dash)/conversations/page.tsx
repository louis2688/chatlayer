import Link from "next/link";
import { requireContext } from "@/lib/server-auth";
import { listConversations } from "@/lib/history";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const { orgId } = await requireContext();
  const rows = await listConversations(orgId);
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Conversations</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Stored chat history across your bots.</p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center text-sm text-neutral-600 dark:text-neutral-400">No conversations yet.</div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
          {rows.map((c) => (
            <li key={c.id}>
              <Link href={`/conversations/${c.id}`} className="flex items-center justify-between gap-4 bg-white dark:bg-neutral-900/40 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{c.botName}</span>
                  <span className="block truncate text-xs text-neutral-500">{c.lastMessage ?? "-"}</span>
                </span>
                <span className="shrink-0 text-right text-xs text-neutral-500">
                  <span className="block">{c.messages} msgs</span>
                  <span className="block">{new Date(c.createdAt).toLocaleDateString()}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}