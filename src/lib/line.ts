/**
 * Tiny wrapper around LINE Messaging API's "push message" endpoint.
 *
 * Docs: https://developers.line.biz/en/reference/messaging-api/#send-push-message
 *
 * Reads the Channel Access Token + target ID from env, so we never accidentally
 * expose them to the browser. Both env vars are SERVER-ONLY (no NEXT_PUBLIC_).
 */

const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

export type LinePushResult =
    | { ok: true }
    | { ok: false; reason: string };

/**
 * Send a single plain-text LINE message to the configured target (group or user).
 * Never throws — returns a result object so the caller can decide whether the
 * user-facing flow should fail when LINE is unreachable.
 */
export async function sendLineText(text: string): Promise<LinePushResult> {
    const token  = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const target = process.env.LINE_NOTIFY_TARGET_ID;

    if (!token || !target) {
        return { ok: false, reason: "LINE env vars not configured" };
    }

    try {
        const res = await fetch(LINE_PUSH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                to: target,
                messages: [{ type: "text", text }],
            }),
        });

        if (!res.ok) {
            const body = await res.text().catch(() => "");
            return { ok: false, reason: `HTTP ${res.status} ${body}` };
        }
        return { ok: true };
    } catch (err) {
        return {
            ok: false,
            reason: err instanceof Error ? err.message : "Unknown LINE error",
        };
    }
}
