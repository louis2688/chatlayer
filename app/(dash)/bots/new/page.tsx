import Link from "next/link";
import BotForm from "@/components/dash/BotForm";

export const dynamic = "force-dynamic";

export default function NewBotPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/bots" className="text-sm text-emerald-400 hover:underline">&larr; Bots</Link>
      <h1 className="font-display mt-2 text-2xl font-semibold">New bot</h1>
      <p className="mb-6 mt-1 text-sm text-neutral-600 dark:text-neutral-400">Point it at an n8n Chat Trigger webhook.</p>
      <BotForm />
    </div>
  );
}