import type { QueryPayload, QueryResponse } from "@/types/query";

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function postQuery(url: string, payload: QueryPayload): Promise<QueryResponse> {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let code: string | undefined;
        let message = `Submission failed with status ${response.status}`;
        try {
            const body = (await response.json()) as { error?: string; code?: string };
            if (body.error) message = body.error;
            if (body.code) code = body.code;
        } catch {
            // ignore parse error
        }
        throw new ApiError(message, response.status, code);
    }

    return (await response.json()) as QueryResponse;
}

export async function submitQuery(payload: QueryPayload): Promise<QueryResponse> {
    return postQuery("/api/queries", payload);
}
