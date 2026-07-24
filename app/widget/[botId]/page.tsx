import Chat from "@/components/Chat";
import { getBot, orgHideBranding, publicConfig } from "@/lib/bots";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chat" };

export default async function WidgetPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const bot = await getBot(botId);
  if (!bot) notFound();
  const hideBranding = await orgHideBranding(bot.organizationId);
  // CSS never legitimately contains "<", so strip every one. A single-pass </style
  // replace was bypassable via a sandwich ("</st</styleyle>") that re-forms </style.
  const css = bot.customCss ? bot.customCss.replace(/</g, "") : null;
  return (
    <>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <Chat config={publicConfig(bot)} variant="full" hideBranding={hideBranding} />
    </>
  );
}