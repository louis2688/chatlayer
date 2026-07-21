"use client";

import { useActionState } from "react";
import { createApiKeyAction, revokeApiKeyAction } from "@/app/(dash)/actions";
import CopyField from "./CopyField";

type Key = { id: string; name: string; prefix: string; createdAt: string | Date; lastUsedAt: string | Date | null };

export default function ApiKeys({ keys }: { keys: Key[] }) {
  const [state, action, pending] = useActionState(
    async (_prev: { plain: string } | null, fd: FormData) => createApiKeyAction(null, fd),
    null,
  );
  const field = "rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/60 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-emerald-500";

  return (
    <div>
      <form action={action} className="flex flex-wrap items-center gap-2">
        <input name="name" placeholder="Key name (e.g. Production)" className={field} />
        <button type="submit" disabled={pending} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-50">
          {pending ? "Creating..." : "Create key"}
        </button>
      </form>

      {state?.plain && (
        <div className="mt-3 rounded-lg border border-emerald-800 bg-emerald-950/30 p-3">
          <p className="mb-2 text-xs text-emerald-300">Copy this now - it won&apos;t be shown again:</p>
          <CopyField value={state.plain} />
        </div>
      )}

      <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        {keys.length === 0 && <li className="px-4 py-3 text-sm text-neutral-500">No API keys yet.</li>}
        {keys.map((k) => (
          <li key={k.id} className="flex items-center justify-between gap-4 bg-white dark:bg-neutral-900/40 px-4 py-3">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{k.name}</span>
              <span className="block font-mono text-xs text-neutral-500">{k.prefix}&hellip; &middot; {k.lastUsedAt ? `used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "never used"}</span>
            </span>
            <form action={revokeApiKeyAction}>
              <input type="hidden" name="keyId" value={k.id} />
              <button type="submit" className="shrink-0 text-xs text-red-400 hover:text-red-300">Revoke</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}