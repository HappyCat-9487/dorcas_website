import Link from "next/link";
import type { NewsItem } from "@/lib/news";

const TAIPEI_FORMATTER = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

function formatPublishDate(iso: string): string {
    return TAIPEI_FORMATTER.format(new Date(iso)).replace(/\//g, "/");
}

/**
 * Homepage "最新消息" — surfaces FAQ entries that the admin has chosen to
 * promote. Hidden entirely (renders nothing) when there are no active posts,
 * so the homepage doesn't end up with an empty section.
 */
export function NewsSection({ items }: { items: NewsItem[] }) {
    if (items.length === 0) return null;

    return (
        <section
            aria-labelledby="latest-news-heading"
            className="bg-[#fdf7ee] py-10 md:py-14"
        >
            <div className="mx-auto max-w-[1440px] px-4 md:px-10">
                {/* Header row */}
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b83553]/70">
                            Latest News
                        </p>
                        <h2
                            id="latest-news-heading"
                            className="mt-1 text-2xl font-bold text-[#7a4020] md:text-3xl"
                        >
                            📣 最新消息
                        </h2>
                    </div>
                    <Link
                        href="/ai-chat"
                        className="text-sm font-medium text-[#b83553] underline-offset-4 hover:underline"
                    >
                        有疑問？問 AI 諮詢 →
                    </Link>
                </div>

                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="group flex h-full flex-col rounded-xl border border-[#e8c9a0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="mb-3 flex items-center gap-2 text-xs">
                                <span className="rounded-full bg-[#b83553]/10 px-2.5 py-0.5 font-medium text-[#b83553]">
                                    {item.category}
                                </span>
                                <time
                                    dateTime={item.publishedAt}
                                    className="text-[#7a4020]/50"
                                >
                                    {formatPublishDate(item.publishedAt)}
                                </time>
                            </div>
                            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-[#7a4020]">
                                {item.title}
                            </h3>
                            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-[#7a4020]/70">
                                {item.snippet}
                            </p>
                            <Link
                                href={`/ai-chat?q=${encodeURIComponent(item.title)}`}
                                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#b83553] underline-offset-4 group-hover:underline"
                            >
                                深入了解
                                <span aria-hidden="true">→</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
