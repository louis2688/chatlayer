"use client";

import { useEffect, useState } from "react";
import type { SessionRow } from "@/lib/analytics";

const EXPIRE_MIN = 30;
const POLL_MS = 10_000;

function ago(input: Date | string) {
  const d = typeof input === "string" ? new Date(input) : input;
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function isActive(input: Date | string) {
  const d = typeof input === "string" ? new Date(input) : input;
  return Date.now() - d.getTime() < EXPIRE_MIN * 60_000;
}
function loc(s: SessionRow) {
  return [s.city, s.region, s.country].filter(Boolean).join(", ") || "-";
}
function visitor(s: SessionRow) {
  return s.name || s.email || s.phone ? [s.name, s.email, s.phone].filter(Boolean).join(" · ") : "Anonymous";
}

export default function SessionsTable({ initial, initialActive }: { initial: SessionRow[]; initialActive: number }) {
  const [rows, setRows] = useState<SessionRow[]>(initial);
  const [active, setActive] = useState(initialActive);
  const [tick, setTick] = useState(0); // re-derive relative times/status between polls

  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const res = await fetch("/api/dash/sessions", { cache: "no-store" });
        if (!res.ok || !alive) return;
        const data = await res.json();
        setRows(data.sessions);
        setActive(data.active);
      } catch {
        /* transient; keep last data */
      }
    }
    const dataTimer = setInterval(poll, POLL_MS);
    const clockTimer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      alive = false;
      clearInterval(dataTimer);
      clearInterval(clockTimer);
    };
  }, []);

  void tick;
  const th = "px-3 py-2 text-left font-medium text-neutral-500";
  const td = "px-3 py-2 whitespace-nowrap";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Sessions</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Live visitor sessions. No message content is stored. Expires {EXPIRE_MIN} min after last activity.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/40">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm tabular-nums"><strong>{active}</strong> active now</span>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">No sessions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className={th}>Status</th>
                  <th className={th}>Visitor</th>
                  <th className={th}>Bot</th>
                  <th className={th}>Location</th>
                  <th className={th}>Device</th>
                  <th className={th}>Msgs</th>
                  <th className={th}>Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {rows.map((s) => {
                  const live = isActive(s.lastSeenAt);
                  return (
                    <tr key={s.id}>
                      <td className={td}>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${live ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500" : "bg-neutral-400"}`} />
                          {live ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className={`${td} max-w-[220px] truncate`} title={visitor(s)}>{visitor(s)}</td>
                      <td className={td}>{s.botName}</td>
                      <td className={td}>{loc(s)}</td>
                      <td className={td}>{[s.browser, s.os].filter(Boolean).join(" / ") || "-"}</td>
                      <td className={`${td} tabular-nums`}>{s.messages}</td>
                      <td className={`${td} text-neutral-500`}>{ago(s.lastSeenAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}