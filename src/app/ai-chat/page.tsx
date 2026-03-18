"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/nav/page-shell";

type Message = { role: "assistant" | "user"; content: string };

const INITIAL: Message[] = [
  { role: "assistant", content: "任何問題，歡迎隨時問我><" },
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error();

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，目前無法回應，請稍後再試。" },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <PageShell hideSocialRail>
      <div
        className="flex flex-col bg-[#f5ca91]"
        style={{ height: "calc(100dvh - 148px)" }}
      >
        {/* ── Message area ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-14 md:py-10">
          <div className="space-y-4">
            {messages.map((msg, i) =>
              msg.role === "assistant" ? (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8928a]">
                    <Sparkles className="size-4 text-white" />
                  </div>
                  <div className="max-w-[78%] rounded-2xl rounded-tl-none bg-[#e8dfd0] px-5 py-3 text-[16px] leading-relaxed text-black/80 shadow-sm">
                    {msg.content || (
                      <span className="animate-pulse text-black/40">●●●</span>
                    )}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[78%] rounded-2xl rounded-tr-none bg-[#e8928a] px-5 py-3 text-[16px] leading-relaxed text-white shadow-sm">
                    {msg.content}
                  </div>
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input bar ────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-black/10 bg-[#f0d5a8] px-5 py-4 md:px-14">
          <div className="flex items-end gap-3 rounded-2xl bg-[#e8dfd0] px-4 py-3 shadow-inner">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="請輸入任何文字"
              rows={2}
              className="flex-1 resize-none bg-transparent text-[16px] text-black/70 outline-none placeholder:text-black/35"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[#e8928a] px-6 py-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              送出
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
