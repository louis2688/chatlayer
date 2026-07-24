// Build the auth header(s) sent to a bot's n8n webhook, mirroring n8n's own
// credential choices so the two ends line up:
//   none   -> nothing
//   basic  -> Authorization: Basic base64(user:pass)
//   header -> a custom header (e.g. an API key or bearer token)
// DB-free on purpose: no drizzle import, so it can be exercised by the selfcheck
// without a database. The two fields double as name/value or user/pass.
type WebhookAuth = {
  webhookAuthType: string | null;
  webhookAuthHeader: string | null;
  webhookAuthValue: string | null;
};

export function webhookAuthHeaders(b: WebhookAuth): Record<string, string> {
  const a = (b.webhookAuthHeader ?? "").trim();
  const v = b.webhookAuthValue ?? "";
  if (b.webhookAuthType === "basic") {
    if (!a) return {}; // need at least a username; an empty password is allowed
    return { Authorization: `Basic ${Buffer.from(`${a}:${v}`).toString("base64")}` };
  }
  if (b.webhookAuthType === "header") {
    if (!a || !v) return {};
    return { [a]: v };
  }
  return {};
}