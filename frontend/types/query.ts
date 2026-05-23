export type RecordingStatus = "idle" | "recording" | "processing" | "done";

export interface QueryPayload {
    user_name: string;
    source_language: string;
    original_transcript: string;
    translated_transcript: string;
    phone_country_code: string;
    phone_number: string;
    phone_full: string;
    client_timestamp: string;
    client_timezone: string;
}

export interface QueryResponse {
    id: string;
    status: "accepted";
    submitted_at: string;
}
