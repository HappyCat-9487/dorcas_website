import OpenAI from "openai";
import { NextRequest } from "next/server";
import type {
    ChatCompletionMessageParam,
    ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";
import { AI_TOOLS, runAiTool } from "@/lib/ai-tools";
import { getKnowledgeBaseText } from "@/lib/ai-knowledge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT_HEADER = `你是「多加旅遊（Dorcas Travel）」的專屬 AI 旅遊助理。
請用親切、專業的繁體中文回答旅客的問題。語氣溫暖友善，回答簡潔、有條理，必要時用條列式說明。

══════════════════════════════════════
回覆規範
══════════════════════════════════════
1. 當客人問到「多加旅遊目前有什麼團」、「最近有什麼 XX 國行程」、「XX 月有什麼團」、「XX 團價格 / 詳細行程」這類涉及「我們家自家資料」的問題時，請務必呼叫 search_tours 或 get_tour_detail 工具拿到真實資料後再回答。不要憑空回答。
2. 工具回傳的 url 欄位是該行程的網站連結。請原樣使用（例如 [行程名稱](/tours/汶萊-和平之鄉的文化朝聖)）。**絕對不要自行加上網域名稱**（禁止寫 https://www.dorcastravel.com/... 或任何 http/https 絕對網址），只允許以「/」開頭的相對路徑。
3. 若工具回傳結果為空，請誠實告訴客人「目前沒有符合條件的行程」，並建議放寬條件或聯絡客服。
4. 一般旅遊問題（簽證、護照、行李、入境卡、保險等）：優先依下方「旅遊知識庫」回答。**若知識庫沒有提到的細節，請誠實說「以官方公告為準，建議出發前再次確認」，不要憑記憶亂答。**
5. 涉及金額、改退費、保險賠付等爭議性議題，請建議客人聯絡客服確認。
6. 不回答與旅遊無關的問題，禮貌引導回旅遊主題。`;

const SYSTEM_PROMPT_FOOTER = `══════════════════════════════════════
多加旅遊服務範圍
══════════════════════════════════════
- 主題式行程：賞櫻、賞楓、極光、郵輪、朝聖等
- 地區涵蓋：日本、韓國、台灣、東南亞、歐洲、美洲、紐澳、郵輪
- 服務：團體旅遊、客製化包團、商務考察、宗教朝聖團
- 客服 / 報名：請參考網站底部聯絡資訊，或加 LINE 官方帳號詢問。`;

async function buildSystemPrompt(): Promise<string> {
    const knowledge = await getKnowledgeBaseText();
    return [SYSTEM_PROMPT_HEADER, "", knowledge, "", SYSTEM_PROMPT_FOOTER]
        .filter(Boolean)
        .join("\n\n");
}

/**
 * Maximum number of tool-call rounds before we force a final answer.
 * 3 is plenty for "search then fetch detail" type flows.
 */
const MAX_TOOL_ROUNDS = 3;

export async function POST(req: NextRequest) {
    const { messages: incoming } = (await req.json()) as {
        messages: { role: "user" | "assistant"; content: string }[];
    };

    // Build the working message list. The system prompt now pulls the FAQ
    // knowledge base from Supabase at request time (cached for 5 min).
    const systemPrompt = await buildSystemPrompt();
    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...incoming.map(
            (m): ChatCompletionMessageParam => ({
                role: m.role,
                content: m.content,
            }),
        ),
    ];

    let finalContent = "";

    try {
        // ── Tool-calling loop ────────────────────────────────────────
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages,
                tools: AI_TOOLS,
                tool_choice: "auto",
                max_tokens: 800,
            });

            const choice = completion.choices[0]?.message;
            if (!choice) break;

            // No tool calls → we have the final answer
            if (!choice.tool_calls || choice.tool_calls.length === 0) {
                finalContent = choice.content ?? "";
                break;
            }

            // Otherwise: record the assistant's tool-call request, then
            // execute each tool and feed results back as `tool` messages.
            messages.push({
                role: "assistant",
                content: choice.content ?? "",
                tool_calls: choice.tool_calls,
            });

            for (const call of choice.tool_calls as ChatCompletionMessageToolCall[]) {
                if (call.type !== "function") continue;
                let parsedArgs: Record<string, unknown> = {};
                try {
                    parsedArgs = call.function.arguments
                        ? JSON.parse(call.function.arguments)
                        : {};
                } catch {
                    parsedArgs = {};
                }

                let result: unknown;
                try {
                    result = await runAiTool(call.function.name, parsedArgs);
                } catch (err) {
                    result = {
                        error: err instanceof Error ? err.message : String(err),
                    };
                }

                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify(result),
                });
            }
        }

        // Safety net: if we ran out of rounds without a final answer, ask the
        // model one more time without tools so we definitely return something
        // user-facing.
        if (!finalContent) {
            const safety = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages,
                max_tokens: 500,
            });
            finalContent = safety.choices[0]?.message?.content ?? "";
        }
    } catch (err) {
        console.error("AI chat error:", err);
        finalContent = "抱歉，目前無法回應，請稍後再試。";
    }

    return new Response(finalContent || "（沒有回應內容）", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
