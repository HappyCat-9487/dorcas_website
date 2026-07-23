import { Suspense } from "react";
import { PageShell } from "@/components/nav/page-shell";
import { AiChatClient } from "@/components/ai/ai-chat-client";

export default function AiChatPage() {
  return (
    <PageShell hideSocialRail>
      <Suspense>
        <AiChatClient />
      </Suspense>
    </PageShell>
  );
}
