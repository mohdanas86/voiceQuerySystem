/**
 * route.ts — POST /api/audio/upload
 * Receives a voice recording, uploads it to Supabase Storage,
 * and returns the public URL for inclusion in ops emails.
 * Ulavi Technologies
 */

// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// This file runs on the server (Next.js API route). Rules:
// 1. Do NOT import browser APIs.
// 2. SUPABASE_SERVICE_ROLE_KEY must NOT have NEXT_PUBLIC_ prefix.
// 3. Never log the audio file contents or the service role key.

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/** Supabase bucket where recordings are stored. Must be set to PUBLIC. */
const SUPABASE_BUCKET_NAME = 'voice-recordings';

/** Length of the random suffix in the filename (for uniqueness). */
const FILENAME_RANDOM_SUFFIX_LENGTH = 8;

/** Audio file extension from MediaRecorder in Chrome/Safari. */
const AUDIO_FILE_EXTENSION = '.webm';

/**
 * Creates a Supabase client using the service role key.
 * This client bypasses row-level security — only use on the server.
 *
 * @returns Authenticated Supabase client
 * @throws If the required environment variables are not set
 */
function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[api/audio/upload] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, key);
}

/**
 * Generates a unique filename for the uploaded recording.
 * Format: {timestamp}-{random-8-chars}.webm
 * Example: 1717123456789-a3f8bc12.webm
 *
 * @returns A unique filename string
 */
function generateUniqueFilename(): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomUUID().slice(0, FILENAME_RANDOM_SUFFIX_LENGTH);
  return `${timestamp}-${randomSuffix}${AUDIO_FILE_EXTENSION}`;
}

/**
 * POST /api/audio/upload
 *
 * Accepts: multipart/form-data with a single field named "audio" containing the recording Blob.
 *
 * Returns on success:  { audioUrl: string }   — the public Supabase URL
 * Returns on failure:  { error: string, code: string }  — with HTTP 502
 *
 * Important: Audio upload failure is non-fatal for the submission flow.
 * The client should continue with audioUrl = "" if this endpoint returns an error.
 */
export async function POST(request: Request): Promise<Response> {
  let supabase;

  try {
    supabase = createSupabaseServerClient();
  } catch (configErr: unknown) {
    // Missing environment variables — don't crash the whole app
    console.error('[api/audio/upload] Supabase config error:', configErr);
    return Response.json(
      { error: 'Audio upload unavailable (server configuration error)', code: 'CONFIG_ERROR' },
      { status: 503 },
    );
  }

  // Parse the incoming FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: 'Invalid request — expected multipart/form-data', code: 'INVALID_REQUEST' },
      { status: 400 },
    );
  }

  const audioFile = formData.get('audio');
  if (!audioFile || !(audioFile instanceof Blob)) {
    return Response.json(
      { error: 'No audio file found in request (expected field name: "audio")', code: 'MISSING_AUDIO' },
      { status: 400 },
    );
  }

  // Convert Blob to ArrayBuffer for Supabase upload
  const audioBuffer = await audioFile.arrayBuffer();
  const filename = generateUniqueFilename();

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .upload(filename, audioBuffer, {
      contentType: 'audio/webm',
      upsert: false, // Never overwrite — filenames are unique by design
    });

  if (uploadError) {
    console.error('[api/audio/upload] Supabase upload failed:', uploadError.message);
    return Response.json(
      { error: 'Audio upload failed', code: 'UPLOAD_ERROR' },
      { status: 502 },
    );
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .getPublicUrl(filename);

  const audioUrl = publicUrlData.publicUrl;

  return Response.json({ audioUrl }, { status: 200 });
}
