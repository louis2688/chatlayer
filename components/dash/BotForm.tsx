import { createBotAction, updateBotAction } from "@/app/(dash)/actions";
import type { Bot } from "@/lib/bots";

const field =
  "w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/60 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-emerald-500";
const label = "block text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 mb-1.5";

export default function BotForm({ bot }: { bot?: Bot }) {
  const editing = !!bot;
  return (
    <form action={editing ? updateBotAction : createBotAction} className="space-y-4">
      {editing && <input type="hidden" name="botId" value={bot!.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">Name</label>
          <input id="name" name="name" required maxLength={80} defaultValue={bot?.name} placeholder="Support Assistant" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="color">Brand color</label>
          <input id="color" name="color" type="color" defaultValue={bot?.color ?? "#1c69d4"} className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/60" />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="webhookUrl">n8n webhook URL</label>
        <input id="webhookUrl" name="webhookUrl" type="url" required defaultValue={bot?.webhookUrl} placeholder="https://your-n8n/webhook/xxxx/chat" className={field} />
        <p className="mt-1 text-xs text-neutral-500">Stays server-side. Never sent to the browser.</p>
      </div>

      <div>
        <label className={label} htmlFor="welcome">Welcome message</label>
        <input id="welcome" name="welcome" maxLength={500} defaultValue={bot?.welcome} placeholder="Hi! How can I help?" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="logoUrl">Logo URL (optional)</label>
          <input id="logoUrl" name="logoUrl" type="url" defaultValue={bot?.logoUrl ?? ""} placeholder="https://..." className={field} />
        </div>
        <div>
          <label className={label} htmlFor="suggestedPrompts">Suggested prompts (one per line)</label>
          <textarea id="suggestedPrompts" name="suggestedPrompts" rows={2} defaultValue={(bot?.suggestedPrompts ?? []).join("\n")} className={field} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="allowedOrigins">Allowed domains (one per line, empty = any)</label>
        <textarea id="allowedOrigins" name="allowedOrigins" rows={2} defaultValue={(bot?.allowedOrigins ?? []).join("\n")} placeholder="https://www.customer.com" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="ratePerSession">Rate / session / min</label>
          <input id="ratePerSession" name="ratePerSession" type="number" min={1} max={1000} defaultValue={bot?.ratePerSession ?? 20} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="ratePerIp">Rate / IP / min</label>
          <input id="ratePerIp" name="ratePerIp" type="number" min={1} max={5000} defaultValue={bot?.ratePerIp ?? 60} className={field} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2 text-sm text-neutral-700 dark:text-neutral-300 dark:text-neutral-300">
            <input type="checkbox" name="isPublic" defaultChecked={bot ? bot.isPublic : true} className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900" />
            Public (no login)
          </label>
        </div>
      </div>

      <details className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
        <summary className="cursor-pointer text-sm text-neutral-700 dark:text-neutral-300 dark:text-neutral-300">Webhook header auth (optional)</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <input name="webhookAuthHeader" defaultValue={bot?.webhookAuthHeader ?? ""} placeholder="Header name" className={field} />
          <input name="webhookAuthValue" defaultValue={bot?.webhookAuthValue ?? ""} placeholder="Header value" className={field} />
        </div>
      </details>

      <details className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
        <summary className="cursor-pointer text-sm text-neutral-700 dark:text-neutral-300 dark:text-neutral-300">Appearance &amp; advanced</summary>
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 dark:text-neutral-300">
              <input type="checkbox" name="rtl" defaultChecked={bot?.rtl ?? false} className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900" />
              Right-to-left layout
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 dark:text-neutral-300">
              <input type="checkbox" name="consentRequired" defaultChecked={bot?.consentRequired ?? false} className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900" />
              Require consent screen
            </label>
          </div>
          <div>
            <label className={label} htmlFor="consentText">Consent text</label>
            <input id="consentText" name="consentText" maxLength={1000} defaultValue={bot?.consentText ?? ""} placeholder="By continuing you agree to..." className={field} />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex items-center gap-2 pb-2 text-sm text-neutral-700 dark:text-neutral-300 dark:text-neutral-300">
              <input type="checkbox" name="allowFileUpload" defaultChecked={bot?.allowFileUpload ?? false} className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900" />
              Allow file upload
            </label>
            <div>
              <label className={label} htmlFor="maxFileSizeMb">Max size (MB)</label>
              <input id="maxFileSizeMb" name="maxFileSizeMb" type="number" min={1} max={25} defaultValue={bot?.maxFileSizeMb ?? 5} className={field} />
            </div>
            <div className="min-w-[12rem] flex-1">
              <label className={label} htmlFor="allowedFileTypes">Allowed types (empty = any)</label>
              <input id="allowedFileTypes" name="allowedFileTypes" defaultValue={(bot?.allowedFileTypes ?? []).join(", ")} placeholder="image/png, application/pdf" className={field} />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="customCss">Custom CSS</label>
            <textarea id="customCss" name="customCss" rows={4} defaultValue={bot?.customCss ?? ""} placeholder=".md-body a { color: hotpink; }" className={`${field} font-mono text-xs`} />
          </div>
        </div>
      </details>

      <button type="submit" className="rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white hover:bg-emerald-400">
        {editing ? "Save changes" : "Create bot"}
      </button>
    </form>
  );
}