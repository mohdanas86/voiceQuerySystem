import type { QueryPayload, QueryResponse } from "@/types/query";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function submitQuery(payload: QueryPayload): Promise<QueryResponse> {
    const response = await fetch(`${baseUrl}/queries`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Submission failed");
    }

    return (await response.json()) as QueryResponse;
}
