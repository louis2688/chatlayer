import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/server-auth";
import { getConversationMessages } from "@/lib/history";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { orgId } = await requireContext();
  const { conversationId } = await params;
  const conv = await getConversationMessages(orgId, conversationId);
  if (!conv) notFound();
  return (
    <div>
      <Link href="/conversations" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">&larr; Conversations</Link>
      <h1 className="font-display mt-2 text-2xl font-semibold">{conv.botName}</h1>
      <p className="mt-1 font-mono text-xs text-neutral-500">session {conv.sessionId}</p>

      <div className="mt-6 space-y-3">
        {conv.messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={m.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-md bg-emerald-600 px-3.5 py-2 text-sm text-white" : "max-w-[80%] rounded-2xl rounded-bl-md bg-neutral-200 dark:bg-neutral-800 px-3.5 py-2 text-sm"}>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
              <p className="mt-1 text-[10px] opacity-60">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}