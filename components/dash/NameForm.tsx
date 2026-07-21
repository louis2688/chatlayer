"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function NameForm({ initial }: { initial: string }) {
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        const r = await authClient.updateUser({ name });
        setSaving(false);
        if (r.error) setMsg(r.error.message || "Failed");
        else {
          setMsg("Saved");
          router.refresh();
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={32}
        className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/60 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-emerald-500"
      />
      <button disabled={saving} className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-500 disabled:opacity-50">
        {saving ? "Saving..." : "Save name"}
      </button>
      {msg && <span className="text-xs text-neutral-600 dark:text-neutral-400">{msg}</span>}
    </form>
  );
}