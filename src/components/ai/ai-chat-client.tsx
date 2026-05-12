"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = { role: "assistant" | "user"; content: string };

const INITIAL: Message[] = [
  { role: "assistant", content: "任何問題，歡迎隨時問我><" },
];

/**
 * Renders the assistant message body as markdown.
 * - GitHub-flavoured markdown (lists, tables, strikethrough)
 * - Internal `/tours/...` links open via Next <Link> (client-side nav)
 * - External links open in new tab
 */
function AssistantMarkdown({ text }: { text: string }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...rest }) => {
            const isInternal = typeof href === "string" && href.startsWith("/");
            if (isInternal) {
              return (
                <Link
                  href={href as string}
                  className="font-medium text-[#b83553] underline-offset-2 hover:underline"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                {...rest}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#b83553] underline-offset-2 hover:underline"
              >
                {children}
              </a>
            );
          },
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          p:  ({ children }) => <p  className="my-2 first:mt-0 last:mb-0">{children}</p>,
          h1: ({ children }) => <h3 className="mb-1 mt-3 text-[17px] font-semibold">{children}</h3>,
          h2: ({ children }) => <h3 className="mb-1 mt-3 text-[17px] font-semibold">{children}</h3>,
          h3: ({ children }) => <h3 className="mb-1 mt-3 text-[17px] font-semibold">{children}</h3>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#5a3e28]">{children}</strong>
          ),
          code: ({ children }) => (
            <code className="rounded bg-black/10 px-1 py-0.5 text-[13px]">{children}</code>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/** Bouncing-dots "AI is typing" indicator. */
function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <span className="size-2 animate-typing-bounce rounded-full bg-[#b83553]/70 [animation-delay:0ms]" />
      <span className="size-2 animate-typing-bounce rounded-full bg-[#b83553]/70 [animation-delay:150ms]" />
      <span className="size-2 animate-typing-bounce rounded-full bg-[#b83553]/70 [animation-delay:300ms]" />
    </span>
  );
}

export function AiChatClient() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // True while the user is composing characters via an IME (e.g. 注音, 拼音, 日本語 IME).
  // We MUST NOT submit on Enter while the IME is still composing — that first
  // Enter is meant to commit the candidate, not send the message.
  const [composing, setComposing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    <div className="flex flex-col bg-[#f5ca91]" style={{ height: "calc(100dvh - 148px)" }}>
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
                  {msg.content
                    ? <AssistantMarkdown text={msg.content} />
                    : <TypingIndicator />}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-[78%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-none bg-[#e8928a] px-5 py-3 text-[16px] leading-relaxed text-white shadow-sm">
                  {msg.content}
                </div>
              </div>
            ),
          )}

          {/* Show a separate typing bubble while we're waiting and the
              assistant placeholder hasn't been pushed yet. */}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-start gap-3">
              <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8928a]">
                <Sparkles className="size-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-[#e8dfd0] px-5 py-4 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
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
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={(e) => {
              // Don't submit while IME composition is in progress (注音/拼音/etc.).
              // We check BOTH our React state (set via onCompositionStart) and the
              // native event flag — different browsers fire the events in slightly
              // different orders and `isComposing` is the most reliable signal.
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !composing &&
                !e.nativeEvent.isComposing &&
                // keyCode 229 is the legacy "IME is still composing" marker.
                e.keyCode !== 229
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="請輸入任何文字（Enter 送出，Shift+Enter 換行）"
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
  );
}

