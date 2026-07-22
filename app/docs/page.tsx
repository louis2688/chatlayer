import Logo from "@/components/Logo";
import Link from "next/link";

export const metadata = { title: "Docs - ChatLayer" };

const NAV: Array<[string, string]> = [
  ["quickstart", "Quickstart"],
  ["backend-integration", "Backend integration"],
  ["widget-api", "Chat widget API"],
  ["session-management", "Session management"],
  ["streaming", "Chat streaming"],
  ["markdown", "Markdown and HTML"],
  ["file-uploads", "File uploads"],
  ["media", "Media attachments"],
  ["custom-css", "Custom CSS"],
  ["rtl", "RTL layout"],
  ["metadata", "Metadata"],
  ["event-callbacks", "Event callbacks"],
  ["voice-input", "Voice input"],
  ["mcp", "MCP server"],
  ["api", "Programmatic API"],
  ["security", "Security and limits"],
];

const card = "rounded-xl border border-white/10 bg-white/[0.03] p-6";
const h2 = "font-display text-xl font-semibold text-white";
const code = "rounded bg-black/50 px-1.5 py-0.5 font-mono text-xs text-emerald-300";
const pre = "mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-emerald-300";
const p = "mt-2 text-sm leading-relaxed text-neutral-400";

function Soon() {
  return (
    <span className="ml-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-amber-400">
      Not supported yet
    </span>
  );
}

function Section({ id, title, soon, children }: { id: string; title: string; soon?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className={`${card} scroll-mt-6`}>
      <h2 className={h2}>
        {title}
        {soon && <Soon />}
      </h2>
      {children}
    </section>
  );
}

export default function DocsPage() {
  return (
    <main className="min-h-dvh bg-black text-neutral-200">
      <div className="m-stripe" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo onDark className="h-16 w-auto" />
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-emerald-400 hover:underline">Dashboard</Link>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-20 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-neutral-500">On this page</p>
            <ul className="space-y-1.5 border-l border-white/10">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="-ml-px block border-l border-transparent pl-3 text-sm text-neutral-400 transition-colors hover:border-emerald-500 hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white">Documentation</h1>
            <p className="mt-2 text-neutral-400">
              ChatLayer is a secure interface and router in front of your n8n Chat workflows. n8n stays the brain; ChatLayer
              handles the widget, authentication, rate limiting, and analytics. Chat message content is never stored.
            </p>
          </div>

          <Section id="quickstart" title="Quickstart">
            <p className={p}>
              Create a bot in <Link href="/bots" className="text-emerald-400 hover:underline">Bots</Link> and point it at your n8n
              <strong className="text-neutral-200"> Chat Trigger</strong> webhook URL. That URL is stored server-side and is never
              sent to the browser. Choose <strong className="text-neutral-200">Public</strong> (anonymous visitors) or{" "}
              <strong className="text-neutral-200">Private</strong> (signed-in members of your workspace only). Then drop one tag on
              your site:
            </p>
            <pre className={pre}>
              <code>{`<script src="https://your-host/embed.js" data-bot="BOT_ID" defer></script>`}</code>
            </pre>
            <p className={p}>
              Add the domains that may use the bot to its origin allowlist. Anything not listed is refused a session.
            </p>
          </Section>

          <Section id="backend-integration" title="Backend integration">
            <p className={p}>For every user message, ChatLayer POSTs JSON to your bot webhook:</p>
            <pre className={pre}>
              <code>{`POST <your n8n Chat Trigger webhook>
Content-Type: application/json

{
  "action": "sendMessage",
  "sessionId": "3f9c...",        // stable per conversation
  "chatInput": "the user message",
  "files": [                      // only when a file is attached
    { "name": "invoice.pdf", "mimeType": "application/pdf", "data": "<base64>" }
  ]
}`}</code>
            </pre>
            <p className={p}>
              A bot can carry one static credential header (set it on the bot) which is sent alongside, so your workflow can verify the
              call came from ChatLayer. Upstream calls time out after 120 seconds and redirects are never followed. Webhook hosts that
              resolve to loopback, private, link-local, or cloud metadata addresses are rejected both when you save the bot and again at
              request time.
            </p>
            <p className={p}>
              Reply with either a single JSON body or a stream. ChatLayer reads the first text field it finds among{" "}
              <span className={code}>content</span>, <span className={code}>delta</span>, <span className={code}>output</span>,{" "}
              <span className={code}>text</span>, <span className={code}>message</span>, <span className={code}>reply</span>.
            </p>
          </Section>

          <Section id="widget-api" title="Chat widget API">
            <p className={p}>The loader is configured with data attributes on the script tag:</p>
            <pre className={pre}>
              <code>{`<script src="https://your-host/embed.js"
        data-bot="BOT_ID"          // required
        data-color="#1c69d4"       // launcher colour
        data-position="left"       // "left" or "right" (default)
        defer></script>`}</code>
            </pre>
            <p className={p}>
              The launcher mounts a button and a lazy iframe: the widget is only fetched the first time it is opened. You can also embed
              the widget directly at <span className={code}>/widget/&lt;botId&gt;</span> in your own iframe, optionally passing a session
              token as <span className={code}>#t=&lt;token&gt;</span>.
            </p>
            <p className={p}>
              Appearance and behaviour come from the bot record, not from the page: name, welcome message, colour, logo, suggested
              prompts, RTL, consent screen, and the file-upload rules. There is currently no JavaScript API for opening or closing the
              widget programmatically.
            </p>
          </Section>

          <Section id="session-management" title="Session management">
            <p className={p}>
              Anonymous visitors get a short-lived session token bound to a single bot. The loader mints it from the{" "}
              <em>parent</em> page, so the browser sends your real origin and ChatLayer can check it against the bot allowlist before
              issuing anything:
            </p>
            <pre className={pre}>
              <code>{`POST /api/session/<botId>   ->   { "token": "..." }`}</code>
            </pre>
            <p className={p}>
              Tokens are HMAC-signed, valid for 24 hours, and only accepted by the bot they were minted for. The widget keeps the token
              in <span className={code}>sessionStorage</span> under <span className={code}>chatlayer.token.&lt;botId&gt;</span>, falling
              back to memory when storage is blocked. Minting is rate limited to 10 per minute per IP per bot.
            </p>
            <p className={p}>
              The <span className={code}>sessionId</span> sent to n8n is what ties a conversation together, so use it as the memory key in
              your workflow. Signed-in dashboard users chat as <span className={code}>user:&lt;id&gt;</span>; server-to-server callers
              control it themselves by passing <span className={code}>sessionId</span> in the request body. Private bots ignore anonymous
              tokens entirely and require a signed-in member of the owning workspace.
            </p>
          </Section>

          <Section id="streaming" title="Chat streaming">
            <p className={p}>
              Replies stream to the widget as <span className={code}>text/plain</span> deltas and the bubble grows token by token. On the
              upstream side ChatLayer parses each line and accepts several shapes, so most n8n setups work unchanged:
            </p>
            <pre className={pre}>
              <code>{`{"content":"Hel"}              // NDJSON token objects
data: {"content":"lo"}         // SSE frames
{"output":"a full reply"}      // single JSON body
plain text                     // raw token`}</code>
            </pre>
            <p className={p}>
              Control frames with no text field and <span className={code}>[DONE]</span> markers are ignored. Workflows that do not stream
              are delivered as one chunk, so nothing needs configuring either way. If the upstream call fails or returns nothing, the
              widget shows a fallback message rather than an empty bubble.
            </p>
          </Section>

          <Section id="markdown" title="Markdown and HTML">
            <p className={p}>
              Bot replies are rendered as markdown and then sanitized before they touch the DOM. Headings, bold and italic, ordered and
              unordered lists, links, inline code, code blocks, blockquotes, tables, and images all render. Scripts, event handlers, and
              other active content are stripped, so a workflow that echoes untrusted text cannot inject script into the host page.
            </p>
            <p className={p}>Messages typed by the user are always treated as plain text.</p>
          </Section>

          <Section id="file-uploads" title="File uploads">
            <p className={p}>
              Enable uploads per bot and set a maximum size and a list of accepted MIME types. The visitor can attach one file per
              message; it is base64 encoded and forwarded to your workflow in the <span className={code}>files</span> array shown in{" "}
              <a href="#backend-integration" className="text-emerald-400 hover:underline">Backend integration</a>.
            </p>
            <p className={p}>
              The limits are enforced on the server as well as in the browser: oversized files are rejected with{" "}
              <span className={code}>413</span> and disallowed types with <span className={code}>415</span>, so the restrictions hold even
              if someone calls the API directly.
            </p>
          </Section>

          <Section id="media" title="Media attachments">
            <p className={p}>
              Outbound media is the file upload above. For media coming back from your workflow, return a markdown image and it renders in
              the reply, sanitized like the rest of the markdown:
            </p>
            <pre className={pre}>
              <code>{`![Delivery route](https://cdn.example.com/route.png)`}</code>
            </pre>
            <p className={p}>
              Links to other file types render as ordinary links. There is no dedicated carousel, gallery, or card component yet.
            </p>
          </Section>

          <Section id="custom-css" title="Custom CSS">
            <p className={p}>
              Each bot can carry its own stylesheet, injected into the widget so you can match a customer brand without forking anything.
              It applies to the widget only and never to the dashboard. Closing style sequences are stripped from the value, so custom CSS
              cannot break out of its style block.
            </p>
            <pre className={pre}>
              <code>{`.cl-bubble-bot { border-radius: 4px; }
.cl-header { letter-spacing: 1px; text-transform: uppercase; }`}</code>
            </pre>
          </Section>

          <Section id="rtl" title="RTL layout">
            <p className={p}>
              Turn on RTL for a bot and the widget flips to right-to-left: message alignment, the composer, and the attachment controls all
              mirror. Use it for Arabic, Hebrew, Farsi, and Urdu deployments. It is per bot, so one workspace can serve both directions.
            </p>
          </Section>

          <Section id="metadata" title="Metadata" soon>
            <p className={p}>
              The webhook payload is currently fixed to <span className={code}>action</span>, <span className={code}>sessionId</span>,{" "}
              <span className={code}>chatInput</span>, and <span className={code}>files</span>. Arbitrary key/value metadata from the host
              page is not forwarded yet.
            </p>
            <p className={p}>
              Until it lands there are two workarounds: set the bot credential header to a static value your workflow can branch on, or
              encode context into the <span className={code}>sessionId</span> when you call the API server to server, for example{" "}
              <span className={code}>crm-42:plan-pro</span>.
            </p>
          </Section>

          <Section id="event-callbacks" title="Event callbacks" soon>
            <p className={p}>
              The loader does not emit lifecycle events and exposes no global object, so there is nothing to subscribe to for opened,
              closed, message sent, or message received. The widget also posts no messages to the parent page. If you need analytics today,
              the dashboard already records sessions, message counts, browsers, and countries without any page instrumentation.
            </p>
          </Section>

          <Section id="voice-input" title="Voice input" soon>
            <p className={p}>
              There is no microphone capture or speech to text in the widget. Visitors type. If you need voice, transcribe upstream and
              call the chat API with the resulting text.
            </p>
          </Section>

          <Section id="mcp" title="MCP server">
            <p className={p}>
              ChatLayer speaks the Model Context Protocol over HTTP, so Claude or Cursor can manage a workspace directly. Authenticate with
              a workspace API key from Settings:
            </p>
            <pre className={pre}>
              <code>{`{
  "mcpServers": {
    "chatlayer": {
      "url": "https://your-host/api/mcp",
      "headers": { "Authorization": "Bearer sk_..." }
    }
  }
}`}</code>
            </pre>
            <p className={p}>
              Tools: <span className={code}>list_bots</span>, <span className={code}>create_bot</span>,{" "}
              <span className={code}>update_bot</span>, <span className={code}>get_analytics</span>. Every call is scoped to the workspace
              that owns the key, and webhook URLs created this way go through the same SSRF checks as the dashboard.
            </p>
          </Section>

          <Section id="api" title="Programmatic API">
            <p className={p}>For server-to-server use, create an API key in Settings and call the bot directly:</p>
            <pre className={pre}>
              <code>{`curl -X POST https://your-host/api/chat/BOT_ID \\
  -H "X-API-Key: sk_..." -H "Content-Type: application/json" \\
  -d '{"message":"hello","sessionId":"crm-42"}'`}</code>
            </pre>
            <p className={p}>
              The response streams as <span className={code}>text/plain</span>. Keys are workspace scoped and can only reach bots in the
              same workspace. Because you supply the <span className={code}>sessionId</span>, you decide what counts as one conversation.
            </p>
          </Section>

          <Section id="security" title="Security and limits">
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-neutral-400">
              <li>&bull; <strong className="text-neutral-200">Hidden webhook</strong> - the n8n URL is a server-side field, never sent to the browser.</li>
              <li>&bull; <strong className="text-neutral-200">Three auth modes</strong> - workspace API key, signed-in member, or an anonymous token bound to one public bot.</li>
              <li>&bull; <strong className="text-neutral-200">Rate limiting</strong> - token buckets per session and per IP, tuned per bot, with spoof-resistant client IP resolution.</li>
              <li>&bull; <strong className="text-neutral-200">IP bans</strong> - blocked addresses are refused at the gateway before any work happens.</li>
              <li>&bull; <strong className="text-neutral-200">Origin allowlist</strong> - only the domains you list can obtain a session.</li>
              <li>&bull; <strong className="text-neutral-200">Input caps</strong> - messages are limited to 4000 characters.</li>
              <li>&bull; <strong className="text-neutral-200">Credits</strong> - one credit per user message; the API returns <span className={code}>402</span> when a workspace runs out.</li>
              <li>&bull; <strong className="text-neutral-200">No message storage</strong> - only per-session metadata is kept for analytics. Chat content is never written to the database.</li>
            </ul>
          </Section>
        </div>
      </div>
    </main>
  );
}