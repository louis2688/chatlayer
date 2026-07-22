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
  // Strip any style-tag breakout so custom CSS can't inject markup.
  const css = bot.customCss ? bot.customCss.replace(/<\/style/gi, "") : null;
  return (
    <>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <Chat config={publicConfig(bot)} variant="full" hideBranding={hideBranding} />
    </>
  );
}