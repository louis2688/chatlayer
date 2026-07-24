"use client";

import Link from "next/link";
import { useState } from "react";

// Real bot shape from the dashboard. The mockup's status/rate fields become
// derived from what we actually store.
export type BotRow = {
  id: string;
  name: string;
  color: string;
  allowAnonymous: boolean;
  ratePerSession: number;
};

const icon = (children: React.ReactNode, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const PlusIcon = (s?: number) => icon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, s);
const ListIcon = (s?: number) => icon(<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>, s);
const GridIcon = (s?: number) => icon(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>, s);
const BotIcon = (s?: number) => icon(<><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8.01" y2="16" /><line x1="16" y1="16" x2="16.01" y2="16" /></>, s);

// Bots have no paused/error state yet, so a live bot reads as Active. The other
// styles are kept so a real Pause/health signal can light them up later.
const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  error: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: color }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function meta(bot: BotRow) {
  return `${bot.allowAnonymous ? "Anonymous" : "Lead capture"} · ${bot.ratePerSession}/min`;
}

const cardClass =
  "flex bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-left hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition";

function ViewToggle({ view, setView }: { view: "list" | "grid"; setView: (v: "list" | "grid") => void }) {
  const base = "grid h-8 w-8 place-items-center rounded-md transition";
  const active = "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm";
  const inactive = "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300";
  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
      <button type="button" onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"} className={`${base} ${view === "list" ? active : inactive}`}>{ListIcon(16)}</button>
      <button type="button" onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} className={`${base} ${view === "grid" ? active : inactive}`}>{GridIcon(16)}</button>
    </div>
  );
}

const addBtn =
  "inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-400 transition";

export default function BotsList({ bots }: { bots: BotRow[] }) {
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Bots <span className="font-normal text-neutral-400">({bots.length})</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Each bot proxies to its own n8n workflow.</p>
        </div>
        {bots.length > 0 && (
          <div className="flex items-center gap-3">
            <ViewToggle view={view} setView={setView} />
            <Link href="/bots/new" className={addBtn}>{PlusIcon(16)} Add bot</Link>
          </div>
        )}
      </div>

      {bots.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800">{BotIcon(24)}</div>
          <h3 className="mb-1 font-semibold">No bots yet</h3>
          <p className="mb-6 text-sm text-neutral-500">Create a bot to connect a chat widget to one of your n8n workflows.</p>
          <Link href="/bots/new" className={addBtn}>{PlusIcon(16)} New bot</Link>
        </div>
      ) : view === "list" ? (
        <div className="flex flex-col gap-3">
          {bots.map((b) => (
            <Link key={b.id} href={`/bots/${b.id}`} className={`${cardClass} items-center gap-3`}>
              <Avatar name={b.name} color={b.color} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{b.name}</div>
                <div className="truncate text-sm text-neutral-500">{meta(b)}</div>
              </div>
              <StatusBadge status="active" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {bots.map((b) => (
            <Link key={b.id} href={`/bots/${b.id}`} className={`${cardClass} flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <Avatar name={b.name} color={b.color} />
                <StatusBadge status="active" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{b.name}</div>
                <div className="truncate text-sm text-neutral-500">{meta(b)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}