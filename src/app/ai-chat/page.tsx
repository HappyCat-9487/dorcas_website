import { PageShell } from "@/components/nav/page-shell";
import { AiChatClient } from "@/components/ai/ai-chat-client";

export default function AiChatPage() {
  return (
    <PageShell hideSocialRail>
      <AiChatClient />
    </PageShell>
  );
}
