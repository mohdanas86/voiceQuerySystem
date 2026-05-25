/**
 * Sends a submission notification email via the EmailJS REST API.
 * Called server-side ONLY — keys are never exposed to the browser.
 */

const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

interface EmailParams {
    user_name: string;
    original_query: string;
    translated_query: string;
    phone: string;
    submitted_at: string;
}

export async function sendSubmissionEmail(params: EmailParams): Promise<void> {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        // Email not configured — log and skip gracefully so the submission still succeeds.
        console.warn("[email] EmailJS env vars not set — skipping email notification.");
        return;
    }

    const body = JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
            name: params.user_name,
            user_name: params.user_name,
            original_query: params.original_query,
            translated_query: params.translated_query,
            phone: params.phone,
            submitted_at: params.submitted_at,
        },
    });

    const res = await fetch(EMAILJS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    if (!res.ok) {
        // Non-fatal — the query is already stored; just log.
        const text = await res.text().catch(() => "(no body)");
        console.error(`[email] EmailJS responded ${res.status}: ${text}`);
    } else {
        console.info("[email] Notification sent for submission.");
    }
}
