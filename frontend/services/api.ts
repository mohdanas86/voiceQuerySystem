import type { QueryPayload, QueryResponse } from "@/types/query";

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
    return postQuery("/api/queries", payload);
}
