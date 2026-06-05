/**
 * tripExtractor.ts — Heuristic scanner that detects trip details from raw voice transcripts.
 * Runs client-side only. Zero API cost. Conservative detection — misses are ok, false
 * positives skip necessary pop-ups and lose data.
 * VoiceBerry | Ulavi Technologies
 */

/**
 * Represents the 4 trip details extracted from a voice transcript.
 * null means "not confidently detected" — a pop-up will be shown for that field.
 * Empty string means "detected but couldn't parse" — treat same as null.
 */
export interface TripDetails {
  /** Destination city or location name. null = not mentioned. */
  city: string | null;
  /** Travel start date (free text, exactly as mentioned). null = not mentioned. */
  datesFrom: string | null;
  /** Travel end/return date (free text). null = not mentioned. */
  datesTo: string | null;
  /** Number of passengers (free text, e.g. "2 adults"). null = not mentioned. */
  passengers: string | null;
  /** Budget information (free text). null = not mentioned. */
  budget: string | null;
}

/** The 4 field keys that can have pop-ups. */
export type TripDetailField = 'city' | 'dates' | 'passengers' | 'budget';

/**
 * Known travel destinations — English names and common alternate spellings.
 * Cover the top 50 Indian domestic destinations + 20 international ones.
 * Also include common Hindi and Tamil spellings where applicable.
 */
const KNOWN_DESTINATIONS: readonly string[] = [
  // South India
  'ooty', 'ootacamund', 'udhagamandalam', 'kodaikanal', 'kodai', 'coorg', 'kodagu',
  'munnar', 'alleppey', 'alappuzha', 'kovalam', 'varkala', 'mysore', 'mysuru',
  'hampi', 'gokarna', 'pondicherry', 'puducherry', 'mahabalipuram',
  // North India / Mountains
  'manali', 'shimla', 'dharamshala', 'mcleod ganj', 'mussoorie', 'nainital',
  'rishikesh', 'haridwar', 'leh', 'ladakh', 'spiti', 'kasol', 'kufri',
  'dehradun', 'auli', 'chopta', 'kedarnath', 'badrinath',
  // Rajasthan
  'jaipur', 'udaipur', 'jodhpur', 'jaisalmer', 'pushkar', 'ajmer', 'mount abu',
  // Beaches
  'goa', 'gokarna', 'tarkarli', 'malvan', 'diu', 'daman', 'puri', 'mandarmani',
  // East / Northeast
  'darjeeling', 'sikkim', 'gangtok', 'shillong', 'cherrapunji', 'kaziranga',
  'assam', 'arunachal', 'meghalaya',
  // Cities (as trip destinations)
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad',
  'kochi', 'ahmedabad', 'pune', 'agra', 'varanasi', 'amritsar',
  // International
  'dubai', 'singapore', 'bali', 'thailand', 'bangkok', 'pattaya', 'paris',
  'london', 'maldives', 'sri lanka', 'nepal', 'bhutan', 'europe',
  'malaysia', 'kuala lumpur', 'vietnam', 'hong kong', 'japan', 'tokyo',
  // Hindi spellings of common destinations
  'मनाली', 'शिमला', 'जयपुर', 'उदयपुर', 'गोवा', 'मसूरी', 'नैनीताल',
  // Tamil spellings
  'கொடைக்கானல்', 'ஊட்டி', 'கேரளா', 'புதுவை',
] as const;

/** English month names for date detection. */
const ENGLISH_MONTHS: readonly string[] = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

/** Hindi month names in Devanagari. */
const HINDI_MONTHS: readonly string[] = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर',
];

/** Tamil month names in Tamil script. */
const TAMIL_MONTHS: readonly string[] = [
  'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
  'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்',
];

/** Words that imply a date is being discussed. */
const DATE_SIGNAL_WORDS: readonly string[] = [
  'from', 'to', 'between', 'starting', 'ending', 'depart', 'return',
  'travel on', 'going on', 'arriving', 'departure', 'arrival',
  // Hindi
  'से', 'तक', 'पर', 'को',
  // Tamil
  'முதல்', 'வரை',
];

/** Numeric date pattern: 15/08, 15-08-2026, 2026-08-15, etc. */
const NUMERIC_DATE_PATTERN = /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/;

/**
 * Regex patterns for detecting passenger counts.
 * Matches: "2 people", "3 adults", "2 लोग", "2 பேர்", etc.
 */
const PASSENGER_PATTERNS: readonly RegExp[] = [
  /(\d+)\s*(person|people|adult|adults|child|children|passenger|passengers|travell?er|travell?ers)/i,
  /(\d+)\s*(लोग|व्यक्ति|यात्री)/,      // Hindi
  /(\d+)\s*(பேர்|நபர்கள்)/,             // Tamil
  /(\d+)\s*(మంది|వ్యక్తులు)/,           // Telugu
  /(\d+)\s*(ಜನ|ವ್ಯಕ್ತಿಗಳು)/,           // Kannada
  /(\d+)\s*(ആള്‍|ആള്‍ക്കാര്‍)/,        // Malayalam
  /(\d+)\s*(জন|মানুষ)/,                 // Bengali
  /(\d+)\s*(लोक|माणसे)/,               // Marathi
];

/**
 * Patterns for detecting budget information.
 * Matches: ₹10000, "30,000 rupees", "budget of 50k", "spend around 20000", etc.
 */
const BUDGET_PATTERNS: readonly RegExp[] = [
  /₹[\s\d,]+/,                                          // ₹ symbol followed by amount
  /(\d[\d,]*)\s*(rupee|rupees|inr)/i,                   // 30000 rupees
  /(\d[\d,]*)\s*k\b/i,                                  // 30k
  /budget\s+(of\s+)?[\d,₹]+/i,                          // budget of 30000
  /spend(ing)?\s+(around\s+)?(₹|rs\.?)?\s*[\d,]+/i,   // spending around 30000
  /cost\s+(of\s+)?(₹|rs\.?)?\s*[\d,]+/i,              // cost of 30000
  /\b(cheap|affordable|luxury|premium|economy|budget)\b/i, // budget tier words
  // Hindi
  /(\d[\d,]*)\s*(रुपये|रुपया)/,
  /बजट/,
  // Tamil
  /(\d[\d,]*)\s*(ரூபாய்|ரூ)/,
  /பட்ஜெட்/,
];

/**
 * Detects the most likely destination from the transcript using a keyword list.
 * Returns the destination name as it appeared in the transcript, or null.
 *
 * @param text - Lowercased transcript text
 * @returns The detected destination string, or null if not found
 */
function detectCity(text: string): string | null {
  for (const dest of KNOWN_DESTINATIONS) {
    if (text.includes(dest)) {
      // Return the destination with proper capitalisation
      return dest.charAt(0).toUpperCase() + dest.slice(1);
    }
  }
  return null;
}

/**
 * Detects whether the transcript contains any date-related information.
 * Does NOT try to parse the exact date — the ops team reads raw text.
 * Returns a non-null value (the matched signal word/month) if dates are mentioned.
 *
 * @param text - Lowercased transcript text
 * @returns A date signal string if detected, or null
 */
function detectDates(text: string): string | null {
  // Check numeric date patterns first (most reliable signal)
  if (NUMERIC_DATE_PATTERN.test(text)) {
    return 'numeric date mentioned';
  }

  // Check month names (English, Hindi, Tamil)
  const allMonths = [...ENGLISH_MONTHS, ...HINDI_MONTHS, ...TAMIL_MONTHS];
  for (const month of allMonths) {
    if (text.includes(month)) {
      return `month mentioned: ${month}`;
    }
  }

  // Check date signal words
  for (const word of DATE_SIGNAL_WORDS) {
    if (text.includes(word)) {
      return `date signal: ${word}`;
    }
  }

  return null;
}

/**
 * Detects passenger count information from the transcript.
 *
 * @param text - Lowercased transcript text
 * @returns The matched passenger string (e.g. "2 adults"), or null
 */
function detectPassengers(text: string): string | null {
  for (const pattern of PASSENGER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0]; // Return the full matched string
    }
  }
  return null;
}

/**
 * Detects budget information from the transcript.
 *
 * @param text - Lowercased transcript text
 * @returns The matched budget string, or null
 */
function detectBudget(text: string): string | null {
  for (const pattern of BUDGET_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

/**
 * Analyses a raw voice transcript and extracts any trip details that were mentioned.
 * Only marks a field as detected when reasonably confident — it is better to ask
 * the user an extra question than to miss a critical detail.
 *
 * @param transcript - Raw transcribed text from AssemblyAI (in any language)
 * @returns TripDetails with null for any undetected fields
 */
export function extractTripDetails(transcript: string): TripDetails {
  const text = transcript.toLowerCase().trim();

  return {
    city:       detectCity(text),
    datesFrom:  detectDates(text),
    datesTo:    null, // Return date is not extracted — always ask
    passengers: detectPassengers(text),
    budget:     detectBudget(text),
  };
}
