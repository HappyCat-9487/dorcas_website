import OpenAI from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `你是多加旅遊（Dorcas Travel）的專屬 AI 旅遊助理。
你的工作是用親切、專業的繁體中文回答旅客的問題，包括：
- 旅遊行程規劃與建議
- 各國簽證、入境須知
- 訂票流程與注意事項
- 旅遊保險、行李、天氣等實用資訊
- 多加旅遊的特色行程介紹

請保持回答簡潔、有條理，語氣溫暖友善，必要時可用條列式說明。`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    max_tokens: 800,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (content) controller.enqueue(encoder.encode(content));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
