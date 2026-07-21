import Link from "next/link";

export const metadata = { title: "Docs - ChatLayer" };

const section = "rounded-xl border border-white/10 bg-white/[0.03] p-6";
const h2 = "font-display text-xl font-semibold";
const code = "rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-emerald-300";

export default function DocsPage() {
  return (
    <main className="min-h-dvh bg-[#0a0f0d] text-neutral-200">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-lg font-semibold text-white">ChatLayer</Link>
        <Link href="/dashboard" className="text-sm text-emerald-400 hover:underline">Dashboard</Link>
      </nav>
      <div className="mx-auto max-w-3xl space-y-6 px-6 pb-16">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Documentation</h1>
          <p className="mt-2 text-neutral-400">Build, secure, and embed chat widgets for your n8n workflows.</p>
        </div>

        <section className={section}>
          <h2 className={h2}>1. Create a bot</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            In the dashboard, open <Link href="/bots" className="text-emerald-400 hover:underline">Bots</Link> and create one.
            Point it at your n8n <strong>Chat Trigger</strong> webhook URL. That URL stays server-side and is never sent to the browser.
            Choose <strong>Public</strong> (anonymous visitors) or <strong>Private</strong> (only signed-in members of your workspace).
          </p>
        </section>

        <section className={section}>
          <h2 className={h2}>2. Embed it</h2>
          <p className="mt-2 text-sm text-neutral-400">Paste one script tag on any allowed site:</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm text-emerald-300">
            <code>{`<script src="https://your-host/embed.js" data-bot="BOT_ID" data-color="#10b981" defer></script>`}</code>
          </pre>
          <p className="mt-2 text-sm text-neutral-400">
            Attributes: <span className={code}>data-bot</span> (required), <span className={code}>data-color</span>, <span className={code}>data-position=&quot;left&quot;</span>.
            The loader mints an origin-checked session in the parent page, so only your allowlisted domains can use the bot.
          </p>
        </section>

        <section className={section}>
          <h2 className={h2}>3. Call the API directly</h2>
          <p className="mt-2 text-sm text-neutral-400">For server-to-server use, create an API key in Settings and call:</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm text-emerald-300">
            <code>{`curl -X POST https://your-host/api/chat/BOT_ID \\
  -H "X-API-Key: sk_..." -H "Content-Type: application/json" \\
  -d '{"message":"hello","sessionId":"crm-42"}'`}</code>
          </pre>
          <p className="mt-2 text-sm text-neutral-400">The response is streamed as <span className={code}>text/plain</span> deltas. Keys only reach bots in the same workspace.</p>
        </section>

        <section className={section}>
          <h2 className={h2}>Manage bots from Claude / Cursor (MCP)</h2>
          <p className="mt-2 text-sm text-neutral-400">Add ChatLayer as an MCP server, authenticated with a workspace API key:</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs text-emerald-300">
            <code>{`{
  "mcpServers": {
    "chatlayer": {
      "url": "https://your-host/api/mcp",
      "headers": { "Authorization": "Bearer sk_..." }
    }
  }
}`}</code>
          </pre>
          <p className="mt-2 text-sm text-neutral-400">Tools: list_bots, create_bot, update_bot, get_analytics, list_conversations.</p>
        </section>

        <section className={section}>
          <h2 className={h2}>Features</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-neutral-400">
            <li>&bull; <strong>Streaming</strong> word-by-word responses (NDJSON/SSE from n8n, or single-shot).</li>
            <li>&bull; <strong>Markdown</strong> rendering in replies (bold, lists, code, links), XSS-sanitized.</li>
            <li>&bull; <strong>Security</strong>: hidden webhook, per-bot rate limits, origin allowlist, SSRF protection.</li>
            <li>&bull; <strong>Customization</strong>: branding, RTL layout, consent screen, custom CSS, suggested prompts.</li>
            <li>&bull; <strong>SaaS</strong>: teams, conversation history, analytics, white-label, message credits.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}