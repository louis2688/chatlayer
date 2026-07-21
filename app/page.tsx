import Link from "next/link";
import Chat from "@/components/Chat";
import { getBot, publicConfig } from "@/lib/bots";

export const dynamic = "force-dynamic";

const FEATURES: Array<[string, string]> = [
  ["Hidden webhooks", "Each bot's n8n URL lives server-side only. Visitors never see it, so nobody can scrape or hammer it directly."],
  ["Rate limiting", "Per-session and per-IP token buckets, tuned per bot. Abuse gets a 429 before it ever reaches n8n."],
  ["Real authentication", "Email + SSO accounts, signed sessions, org-scoped API keys. Public or private, per bot."],
  ["Multi-tenant SaaS", "Organizations, teams, conversation history, analytics, and white-label branding built in."],
];

export default async function Home() {
  const bot = await getBot("demo");
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0a0f0d] text-[#e7ece9]">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-lg font-semibold tracking-tight">ChatLayer</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="text-neutral-300 hover:text-white">Log in</Link>
          <Link href="/signup" className="rounded-lg bg-emerald-500 px-3.5 py-1.5 font-medium text-white hover:bg-emerald-400">Start free</Link>
        </div>
      </nav>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" strokeLinejoin="round" />
            </svg>
            ChatLayer &middot; for n8n
          </p>
          <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Your n8n chat,
            <br />
            <span className="text-emerald-400">secured and multi-tenant.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-neutral-400">
            A branded chat frontend and security gateway for n8n Chat workflows.
            Manage many bots, store conversations, gate access with real auth, and
            ship a white-label widget your customers embed with one script tag.
          </p>

          <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {FEATURES.map(([title, desc]) => (
              <div key={title}>
                <dt className="font-medium text-neutral-100">{title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-neutral-400">{desc}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white hover:bg-emerald-400">Create your workspace</Link>
            <Link href="/dashboard" className="rounded-lg border border-white/15 px-5 py-2.5 font-medium text-neutral-200 hover:border-white/30">Open dashboard</Link>
          </div>

          <div className="mt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">Embed any bot</p>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-emerald-300">
              <code>{`<script src="https://your-host/embed.js" data-bot="BOT_ID" defer></script>`}</code>
            </pre>
          </div>
        </div>

        <div className="lg:pt-10">
          {bot ? (
            <Chat config={publicConfig(bot)} variant="panel" />
          ) : (
            <div className="grid h-[560px] place-items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-neutral-400">
              Run <code className="mx-1 rounded bg-black/40 px-1.5 py-0.5 font-mono text-emerald-300">npm run seed</code> to create the demo bot.
            </div>
          )}
          <p className="mt-3 text-center font-mono text-[11px] text-neutral-500">live demo &middot; the &quot;demo&quot; bot</p>
        </div>
      </div>

      <footer className="relative border-t border-white/5 py-6 text-center font-mono text-xs text-neutral-600">
        Build with n8n. Deploy with ChatLayer.
      </footer>
    </main>
  );
}