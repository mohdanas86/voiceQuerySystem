import type { QueryPayload, QueryResponse } from "@/types/query";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function postQuery(url: string, payload: QueryPayload): Promise<QueryResponse> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
    }

    return (await response.json()) as QueryResponse;
}

export async function submitQuery(payload: QueryPayload): Promise<QueryResponse> {
    try {
        return await postQuery(`${baseUrl}/queries`, payload);
    } catch (error) {
        const isLocalBackend = baseUrl.includes("localhost:8000") || baseUrl.includes("127.0.0.1:8000");
        if (!isLocalBackend) {
            throw error;
        }

        return postQuery("/api/queries", payload);
    }
}
