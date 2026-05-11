import OpenAI from "openai";
import { NextRequest } from "next/server";
import type {
    ChatCompletionMessageParam,
    ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";
import { AI_TOOLS, runAiTool } from "@/lib/ai-tools";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `你是「多加旅遊（Dorcas Travel）」的專屬 AI 旅遊助理。
請用親切、專業的繁體中文回答旅客的問題。語氣溫暖友善，回答簡潔、有條理，必要時用條列式說明。

══════════════════════════════════════
回覆規範
══════════════════════════════════════
1. 當客人問到「多加旅遊目前有什麼團」、「最近有什麼 XX 國行程」、「XX 月有什麼團」、「XX 團價格 / 詳細行程」這類涉及「我們家自家資料」的問題時，請務必呼叫 search_tours 或 get_tour_detail 工具拿到真實資料後再回答。不要憑空回答。
2. 工具回傳的 url 欄位是該行程的網站連結，請在回覆中以 markdown 連結方式提供（例如 [行程名稱](/tours/xxx)）讓客人點擊。
3. 若工具回傳結果為空，請誠實告訴客人「目前沒有符合條件的行程」，並建議放寬條件或聯絡客服。
4. 簽證 / 護照 / 保險 / 行李等規定可能變動，回答時提醒客人「以官方公告為準」。
5. 涉及金額、改退費、保險賠付等爭議性議題，請建議客人聯絡客服確認。
6. 不回答與旅遊無關的問題，禮貌引導回旅遊主題。

══════════════════════════════════════
旅遊常見問題知識庫（FAQ）
══════════════════════════════════════

【護照】
- 出國時護照「剩餘效期」必須 6 個月以上（從回國日起算），少數國家可放寬，但建議一律遵守 6 個月原則。
- 未滿 14 歲首次辦理護照需本人親至外交部領事事務局；已滿 14 歲可委託代辦。
- 護照遺失：立即到當地警察局報案 → 持報案證明至駐外館處辦理「入國證明書」回國。

【簽證（常見國家）】
- 日本：台灣護照免簽證，可停留 90 天。
- 韓國：免簽證 90 天。
- 歐洲申根區（法、德、義、西、瑞士、北歐等）：免簽證 90 天 / 180 天內。2026 年起需事先申請 ETIAS 電子旅行授權（小額費用，線上申辦）。
- 英國：免簽證 6 個月。2026 年起需事先申請 ETA 電子旅行授權。
- 美國：免簽證 90 天，但需事先申請 ESTA（約 USD 21，線上申辦）。
- 加拿大：免簽證 6 個月，需事先申請 eTA（約 CAD 7）。
- 中國大陸：需辦「台胞證」。
- 紐西蘭、澳洲：需事先申請電子旅行授權（NZeTA / ETA）。
- 簽證 / ETA / ESTA 都建議出發前「至少兩週」辦妥。

【班機 / 機票】
- 國際線建議提前 3 小時抵達機場、國內線提前 2 小時。
- 行李規定（一般經濟艙）：託運 23kg × 1～2 件（依航空公司）；手提行李 7kg、長寬高總和不超過 115cm。
- 鋰電池、行動電源「只能放手提行李、不能託運」。容量上限通常 100Wh，超過需事先申請。
- 液體 / 膏狀物（手提）：單瓶 100ml 以下，全部放入 1 公升透明夾鏈袋。
- 機票改票 / 退票規則依航空公司與票種，廉航通常不可退；建議下單前確認規則。

【旅遊保險】
- 強烈建議投保「旅遊平安險 + 旅遊不便險 + 海外醫療險」三合一。
- 信用卡刷團費送的保險通常只涵蓋「公共運輸期間」，建議另保。
- 海外就醫請保留收據、診斷證明正本，回國 90 天內向保險公司申請理賠。

【行程相關】
- 報名後若需取消，依「國外旅遊定型化契約」規定，越接近出發日，可退費比例越低（出發前 1 日內可能無法退費）。詳細條款以契約為準。
- 旅遊行程中若遇天災、政變等不可抗力，旅行社會盡力協助調整，但相關費用可能依航空公司 / 飯店規定處理。

【匯率 / 兌幣】
- 建議在台灣銀行先換好少量現金，當地大額消費刷信用卡較划算。
- 日本、韓國便利商店多接受信用卡與行動支付（LINE Pay、Apple Pay）。
- 歐洲建議備少量歐元現金，部分小店或廁所只收現金。

【天氣 / 衣著】
- 日本櫻花季：3 月底～4 月中（東京、京都），北海道 5 月初。
- 北歐極光季：9 月～3 月，建議準備防風防水羽絨外套、雪靴、暖暖包。
- 東南亞（泰、越、新馬）：全年高溫，5～10 月為雨季。

══════════════════════════════════════
多加旅遊服務範圍
══════════════════════════════════════
- 主題式行程：賞櫻、賞楓、極光、郵輪、朝聖等
- 地區涵蓋：日本、韓國、台灣、東南亞、歐洲、美洲、紐澳、郵輪
- 服務：團體旅遊、客製化包團、商務考察、宗教朝聖團
- 客服 / 報名：請參考網站底部聯絡資訊，或加 LINE 官方帳號詢問。`;

/**
 * Maximum number of tool-call rounds before we force a final answer.
 * 3 is plenty for "search then fetch detail" type flows.
 */
const MAX_TOOL_ROUNDS = 3;

export async function POST(req: NextRequest) {
    const { messages: incoming } = (await req.json()) as {
        messages: { role: "user" | "assistant"; content: string }[];
    };

    // Build the working message list. We allow tool messages in here as the
    // loop progresses.
    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
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
