/**
 * i18n.ts — Static localisation dictionary for all 8 supported languages.
 * All UI strings live here. Never hardcode text in JSX — always use t().
 * VoiceBerry | Ulavi Technologies
 */

export type SupportedLang =
  | 'auto' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu' | 'pa' | 'or' | 'as' | 'ur' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar' | 'tr' | 'nl' | 'pl' | 'sv' | 'da' | 'fi' | 'no' | 'cs' | 'el' | 'he' | 'id' | 'ms' | 'th' | 'vi' | 'uk' | 'ro' | 'hu' | 'sk' | 'bg' | 'hr' | 'sr' | 'sl' | 'et' | 'lv' | 'lt' | 'fa' | 'hy' | 'ka' | 'af' | 'sq' | 'am' | 'az' | 'eu' | 'be' | 'bs' | 'ca' | 'gl' | 'is' | 'kk' | 'ky' | 'mk' | 'mn' | 'ne' | 'si' | 'sw' | 'uz' | 'cy' | 'yo' | 'zu';

export interface LangStrings {
  // ── Language Picker Screen ─────────────────────────────────────────────────
  langPickerTitle: string;
  langPickerSubtitle: string;
  langPickerAutoDetect: string;

  // ── Record Screen ─────────────────────────────────────────────────────────
  recordStep: string;
  recordTitle: string;
  recordSubtitle: string;
  recordIdle: string;
  recordRecording: string;
  recordProcessing: string;
  recordDone: string;
  recordTimer: string;
  recordContinue: string;
  recordTranscriptPreview: string;
  recordMinSeconds: string;

  // ── Pop-up Questions ──────────────────────────────────────────────────────
  popupTitle: string;
  popupSkip: string;
  popupNext: string;
  popupCityQuestion: string;
  popupCityPlaceholder: string;
  popupDatesQuestion: string;
  popupDatesFromPlaceholder: string;
  popupDatesToPlaceholder: string;
  popupPassengersQuestion: string;
  popupPassengersPlaceholder: string;
  popupAdultsLabel: string;
  popupChildrenLabel: string;
  popupBudgetQuestion: string;
  popupBudgetPlaceholder: string;

  // ── Budget Star Tier Labels ────────────────────────────────────────────────
  budgetTier1Label: string;
  budgetTier1Range: string;
  budgetTier2Label: string;
  budgetTier2Range: string;
  budgetTier3Label: string;
  budgetTier3Range: string;
  budgetTier4Label: string;
  budgetTier4Range: string;
  budgetTier5Label: string;
  budgetTier5Range: string;
  budgetStarPlaceholder: string;

  // ── Review Screen ─────────────────────────────────────────────────────────
  reviewStep: string;
  reviewTitle: string;
  reviewSubtitle: string;
  reviewTranscriptLabel: string;
  reviewCityLabel: string;
  reviewDatesLabel: string;
  reviewPassengersLabel: string;
  reviewBudgetLabel: string;
  reviewEmailLabel: string;
  reviewEmailPlaceholder: string;
  reviewPhoneLabel: string;
  reviewNameLabel: string;
  reviewNotProvided: string;
  reviewSend: string;
  reviewSending: string;
  reviewBack: string;

  // ── Validation Errors ─────────────────────────────────────────────────────
  errorEmail: string;
  errorPhone: string;
  errorName: string;
  errorTranscript: string;

  // ── Confirmation Screen ───────────────────────────────────────────────────
  confirmStep: string;
  confirmTitle: string;
  confirmBody: string;
  confirmSubAnotherQuery: string;

  // ── Recording/System Errors ───────────────────────────────────────────────
  errorNoSpeech: string;
  errorTooShort: string;
  errorGeneral: string;
  errorMicBlocked: string;
  errorBrowserNoMic: string;
  detailsAnalysing: string;
  detailsAllDetected: string;
  detailsRedirecting: string;
  popupAdultsSub: string;
  popupChildrenSub: string;
}

export const enStrings: LangStrings = {
  langPickerTitle: "Select your language",
  langPickerSubtitle: "All screens will be shown in your selected language",
  langPickerAutoDetect: "Auto-detect",
  recordStep: "Step 1 of 4",
  recordTitle: "Record your query.",
  recordSubtitle: "Speak about your travel plan in your language — up to 60 seconds.",
  recordIdle: "Tap to start speaking",
  recordRecording: "Recording — tap to stop",
  recordProcessing: "Converting speech…",
  recordDone: "Done — tap to record again",
  recordTimer: "Max 60 seconds",
  recordContinue: "Continue →",
  recordTranscriptPreview: "Transcript preview",
  recordMinSeconds: "Please record for at least 3 seconds.",
  popupTitle: "A quick question",
  popupSkip: "Skip",
  popupNext: "Next",
  popupCityQuestion: "Which city or destination are you travelling to?",
  popupCityPlaceholder: "E.g., Ooty, Kodaikanal, Paris",
  popupDatesQuestion: "When are you planning to travel?",
  popupDatesFromPlaceholder: "From date (e.g. 15 Aug 2026)",
  popupDatesToPlaceholder: "To date (e.g. 20 Aug 2026)",
  popupPassengersQuestion: "How many people will be travelling?",
  popupPassengersPlaceholder: "E.g., 2 adults, 1 child",
  popupAdultsLabel: "Adults",
  popupChildrenLabel: "Children (0-12 yrs)",
  popupBudgetQuestion: "What is your approximate budget for this trip?",
  popupBudgetPlaceholder: "Select a star rating below",
  budgetTier1Label: "Economy",
  budgetTier1Range: "Under ₹10,000 per person",
  budgetTier2Label: "Budget",
  budgetTier2Range: "₹10,000 – ₹25,000 per person",
  budgetTier3Label: "Mid-range",
  budgetTier3Range: "₹25,000 – ₹50,000 per person",
  budgetTier4Label: "Premium",
  budgetTier4Range: "₹50,000 – ₹1,00,000 per person",
  budgetTier5Label: "Luxury",
  budgetTier5Range: "₹1,00,000+ per person",
  budgetStarPlaceholder: "Tap a star to select your budget",
  reviewStep: "Step 3 of 4",
  reviewTitle: "Review & submit.",
  reviewSubtitle: "Check your details before sending.",
  reviewTranscriptLabel: "Your query",
  reviewCityLabel: "Destination",
  reviewDatesLabel: "Travel dates",
  reviewPassengersLabel: "Number of travellers",
  reviewBudgetLabel: "Budget",
  reviewEmailLabel: "Your Email Address",
  reviewEmailPlaceholder: "you@example.com",
  reviewPhoneLabel: "Your Mobile Number",
  reviewNameLabel: "Your Name",
  reviewNotProvided: "Not provided",
  reviewSend: "Send query →",
  reviewSending: "Sending…",
  reviewBack: "← Back",
  errorEmail: "Please enter a valid email address.",
  errorPhone: "Please enter a valid phone number with country code.",
  errorName: "Please enter your name.",
  errorTranscript: "Please provide a transcript before sending.",
  confirmStep: "Step 4 of 4 — Complete",
  confirmTitle: "Query submitted.",
  confirmBody: "Thank you for reaching out! Our operations team has received your travel request and will get back to you very soon.",
  confirmSubAnotherQuery: "Submit another query",
  errorNoSpeech: "No speech was detected. Please speak louder and more clearly.",
  errorTooShort: "Recording too short — please speak for at least a few seconds.",
  errorGeneral: "Something went wrong. Please try recording again.",
  errorMicBlocked: "Microphone access is blocked. Please allow mic permissions and try again.",
  errorBrowserNoMic: "Audio recording is not supported in this browser.",
  detailsAnalysing: "Analysing your query...",
  detailsAllDetected: "Great! We found all your trip details.",
  detailsRedirecting: "Redirecting you to review...",
  popupAdultsSub: "Ages 13 or above",
  popupChildrenSub: "Ages 0 to 12",
};

const hiStrings: LangStrings = {
  langPickerTitle: "अपनी भाषा चुनें",
  langPickerSubtitle: "सभी स्क्रीन आपकी चुनी हुई भाषा में दिखाई देंगे",
  langPickerAutoDetect: "ऑटो-डिटेक्ट (स्वचालित)",
  recordStep: "चरण 1 का 4",
  recordTitle: "अपनी क्वेरी रिकॉर्ड करें।",
  recordSubtitle: "अपनी भाषा में अपनी यात्रा योजना के बारे में बात करें - 60 सेकंड तक।",
  recordIdle: "बोलना शुरू करने के लिए टैप करें",
  recordRecording: "रिकॉर्डिंग जारी है - रोकने के लिए टैप करें",
  recordProcessing: "आवाज़ को टेक्स्ट में बदला जा रहा है...",
  recordDone: "हो गया - फिर से रिकॉर्ड करने के लिए टैप करें",
  recordTimer: "अधिकतम 60 सेकंड",
  recordContinue: "आगे बढ़ें →",
  recordTranscriptPreview: "ट्रांसक्रिप्ट पूर्वावलोकन",
  recordMinSeconds: "कृपया कम से कम 3 सेकंड के लिए रिकॉर्ड करें।",
  popupTitle: "एक त्वरित सवाल",
  popupSkip: "छोड़ें",
  popupNext: "अगला",
  popupCityQuestion: "आप किस शहर या गंतव्य की यात्रा कर रहे हैं?",
  popupCityPlaceholder: "जैसे: ऊटी, कोडाईकनाल, पेरिस",
  popupDatesQuestion: "आप कब यात्रा करने की योजना बना रहे हैं?",
  popupDatesFromPlaceholder: "शुरू होने की तारीख (जैसे: 15 अगस्त 2026)",
  popupDatesToPlaceholder: "वापसी की तारीख (जैसे: 20 अगस्त 2026)",
  popupPassengersQuestion: "कितने लोग यात्रा करेंगे?",
  popupPassengersPlaceholder: "जैसे: 2 वयस्क, 1 बच्चा",
  popupAdultsLabel: "वयस्क",
  popupChildrenLabel: "बच्चे (0-12 वर्ष)",
  popupBudgetQuestion: "इस यात्रा के लिए आपका अनुमानित बजट क्या है?",
  popupBudgetPlaceholder: "नीचे स्टार रेटिंग चुनें",
  budgetTier1Label: "सस्ता (इकोनॉमी)",
  budgetTier1Range: "₹10,000 प्रति व्यक्ति से कम",
  budgetTier2Label: "कम बजट",
  budgetTier2Range: "₹10,000 - ₹25,000 प्रति व्यक्ति",
  budgetTier3Label: "मध्यम श्रेणी",
  budgetTier3Range: "₹25,000 - ₹50,000 प्रति व्यक्ति",
  budgetTier4Label: "प्रीमियम",
  budgetTier4Range: "₹50,000 - ₹1,00,000 प्रति व्यक्ति",
  budgetTier5Label: "लक्जरी",
  budgetTier5Range: "₹1,00,000+ प्रति व्यक्ति",
  budgetStarPlaceholder: "अपना बजट चुनने के लिए स्टार पर टैप करें",
  reviewStep: "चरण 3 का 4",
  reviewTitle: "समीक्षा करें और सबमिट करें।",
  reviewSubtitle: "भेजने से पहले अपने विवरण की जांच करें।",
  reviewTranscriptLabel: "आपकी क्वेरी",
  reviewCityLabel: "गंतव्य",
  reviewDatesLabel: "यात्रा की तारीखें",
  reviewPassengersLabel: "यात्रियों की संख्या",
  reviewBudgetLabel: "बजट",
  reviewEmailLabel: "आपका ईमेल पता",
  reviewEmailPlaceholder: "you@example.com",
  reviewPhoneLabel: "आपका मोबाइल नंबर",
  reviewNameLabel: "आपका नाम",
  reviewNotProvided: "प्रदान नहीं किया गया",
  reviewSend: "क्वेरी भेजें →",
  reviewSending: "भेजा जा रहा है...",
  reviewBack: "← वापस",
  errorEmail: "कृपया एक मान्य ईमेल पता दर्ज करें।",
  errorPhone: "कृपया देश कोड के साथ एक मान्य फोन नंबर दर्ज करें।",
  errorName: "कृपया अपना नाम दर्ज करें।",
  errorTranscript: "कृपया भेजने से पहले एक ट्रांसक्रिप्ट प्रदान करें।",
  confirmStep: "चरण 4 का 4 - पूर्ण",
  confirmTitle: "क्वेरी सबमिट हो गई।",
  confirmBody: "हमसे संपर्क करने के लिए धन्यवाद! हमारी संचालन टीम को आपका यात्रा अनुरोध प्राप्त हो गया है और वे बहुत जल्द आपसे संपर्क करेंगे।",
  confirmSubAnotherQuery: "एक और क्वेरी सबमिट करें",
  errorNoSpeech: "कोई आवाज़ नहीं पहचानी गई। कृपया थोड़ा तेज़ और साफ़ बोलें।",
  errorTooShort: "रिकॉर्डिंग बहुत छोटी है - कृपया कम से कम कुछ सेकंड के लिए बोलें।",
  errorGeneral: "कुछ गड़बड़ हो गई। कृपया फिर से रिकॉर्ड करने का प्रयास करें।",
  errorMicBlocked: "माइक्रोफ़ोन एक्सेस ब्लॉक है। कृपया माइक्रोफ़ोन अनुमति दें और फिर से प्रयास करें।",
  errorBrowserNoMic: "इस ब्राउज़र में ऑडियो रिकॉर्डिंग समर्थित नहीं है।",
  detailsAnalysing: "आपकी क्वेरी का विश्लेषण किया जा रहा है...",
  detailsAllDetected: "बहुत बढ़िया! हमें आपकी यात्रा के सभी विवरण मिल गए हैं।",
  detailsRedirecting: "समीक्षा पर ले जाया जा रहा है...",
  popupAdultsSub: "12 वर्ष से अधिक",
  popupChildrenSub: "0 से 12 वर्ष",
};

const taStrings: LangStrings = {
  langPickerTitle: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
  langPickerSubtitle: "அனைத்து திரைகளும் நீங்கள் தேர்ந்தெடுத்த மொழியில் காண்பிக்கப்படும்",
  langPickerAutoDetect: "தானியங்கி கண்டறிதல்",
  recordStep: "படி 1/4",
  recordTitle: "உங்கள் கேள்வியைப் பதிவு செய்யவும்.",
  recordSubtitle: "உங்கள் பயணத் திட்டத்தைப் பற்றி உங்கள் மொழியில் பேசுங்கள் - 60 விநாடிகள் வரை.",
  recordIdle: "பேசத் தொடங்க தட்டவும்",
  recordRecording: "பதிவு செய்யப்படுகிறது — நிறுத்த தட்டவும்",
  recordProcessing: "பேச்சை உரையாக மாற்றுகிறது…",
  recordDone: "முடிந்தது — மீண்டும் பதிவு செய்ய தட்டவும்",
  recordTimer: "அதிகபட்சம் 60 விநாடிகள்",
  recordContinue: "தொடரவும் →",
  recordTranscriptPreview: "உரை முன்னோட்டம்",
  recordMinSeconds: "தயவுசெய்து குறைந்தபட்சம் 3 வினாடிகளாவது பதிவு செய்யவும்.",
  popupTitle: "ஒரு விரைவான கேள்வி",
  popupSkip: "தவிர்க்கவும்",
  popupNext: "அடுத்து",
  popupCityQuestion: "நீங்கள் எந்த நகரத்திற்கு அல்லது இடத்திற்கு பயணம் செய்கிறீர்கள்?",
  popupCityPlaceholder: "உதாரணமாக: ஊட்டி, கொடைக்கானல், பாரிஸ்",
  popupDatesQuestion: "நீங்கள் எப்போது பயணம் செய்ய திட்டமிட்டுள்ளீர்கள்?",
  popupDatesFromPlaceholder: "பயணத் தொடக்கத் தேதி (உதா: 15 ஆகஸ்ட் 2026)",
  popupDatesToPlaceholder: "பயண முடிவுத் தேதி (உதா: 20 ஆகஸ்ட் 2026)",
  popupPassengersQuestion: "எத்தனை பேர் பயணம் செய்கிறார்கள்?",
  popupPassengersPlaceholder: "உதா: 2 பெரியவர்கள், 1 குழந்தை",
  popupAdultsLabel: "பெரியவர்கள்",
  popupChildrenLabel: "குழந்தைகள் (0-12 வயது)",
  popupBudgetQuestion: "இந்தப் பயணத்திற்கான உங்கள் தோராயமான பட்ஜெட் என்ன?",
  popupBudgetPlaceholder: "கீழே உள்ள நட்சத்திர மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்",
  budgetTier1Label: "மலிவு (எகனாமி)",
  budgetTier1Range: "ஒரு நபருக்கு ₹10,000-க்குள்",
  budgetTier2Label: "பட்ஜெட்",
  budgetTier2Range: "ஒரு நபருக்கு ₹10,000 - ₹25,000",
  budgetTier3Label: "நடுத்தரம்",
  budgetTier3Range: "ஒரு நபருக்கு ₹25,000 - ₹50,000",
  budgetTier4Label: "பிரீமியம்",
  budgetTier4Range: "ஒரு நபருக்கு ₹50,000 - ₹1,00,000",
  budgetTier5Label: "ஆடம்பரம்",
  budgetTier5Range: "ஒரு நபருக்கு ₹1,00,000-க்கு மேல்",
  budgetStarPlaceholder: "உங்கள் பட்ஜெட்டைத் தேர்ந்தெடுக்க ஒரு நட்சத்திரத்தைத் தட்டவும்",
  reviewStep: "படி 3/4",
  reviewTitle: "சரிபார்த்து சமர்ப்பிக்கவும்.",
  reviewSubtitle: "அனுப்புவதற்கு முன் உங்கள் விவரங்களைச் சரிபார்க்கவும்.",
  reviewTranscriptLabel: "உங்கள் கேள்வி",
  reviewCityLabel: "இடம்",
  reviewDatesLabel: "பயணத் தேதிகள்",
  reviewPassengersLabel: "பயணிகளின் எண்ணிக்கை",
  reviewBudgetLabel: "பட்ஜெட்",
  reviewEmailLabel: "உங்கள் மின்னஞ்சல் முகவரி",
  reviewEmailPlaceholder: "you@example.com",
  reviewPhoneLabel: "உங்கள் கைபேசி எண்",
  reviewNameLabel: "உங்கள் பெயர்",
  reviewNotProvided: "வழங்கப்படவில்லை",
  reviewSend: "கேள்வியை சமர்ப்பிக்கவும் →",
  reviewSending: "அனுப்பப்படுகிறது…",
  reviewBack: "← பின்னே",
  errorEmail: "தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
  errorPhone: "தயவுசெய்து நாட்டின் குறியீட்டுடன் சரியான கைபேசி எண்ணை உள்ளிடவும்.",
  errorName: "தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.",
  errorTranscript: "தயவுசெய்து அனுப்புவதற்கு முன் பேச்சை உரையாக்கி வழங்கவும்.",
  confirmStep: "படி 4/4 — நிறைவுற்றது",
  confirmTitle: "கேள்வி சமர்ப்பிக்கப்பட்டது.",
  confirmBody: "தொடர்பு கொண்டதற்கு நன்றி! எங்களது செயல்பாட்டுக் குழு உங்கள் பயணக் கோரிக்கையைப் பெற்றுக்கொண்டது, மிக விரைவில் உங்களைத் தொடர்பு கொள்வார்கள்.",
  confirmSubAnotherQuery: "மற்றொரு கேள்வியைச் சமர்ப்பிக்கவும்",
  errorNoSpeech: "பேச்சு எதுவும் கண்டறியப்படவில்லை. தயவுசெய்து சத்தமாகவும் தெளிவாகவும் பேசவும்.",
  errorTooShort: "பதிவு மிகவும் குறுகியது — தயவுசெய்து சில வினாடிகள் பேசவும்.",
  errorGeneral: "ஏதோ தவறு நடந்துவிட்டது. தயவுசெய்து மீண்டும் பதிவு செய்ய முயற்சிக்கவும்.",
  errorMicBlocked: "ஒலிவாங்கி அணுகல் தடுக்கப்பட்டுள்ளது. தயவுசெய்து ஒலிவாங்கி அனுமதியை வழங்கி மீண்டும் முயற்சிக்கவும்.",
  errorBrowserNoMic: "இந்த ஒலிப்பதிவு உலாவியால் ஆதரிக்கப்படவில்லை.",
  detailsAnalysing: "உங்கள் கேள்வி பகுப்பாய்வு செய்யப்படுகிறது...",
  detailsAllDetected: "அருமை! உங்களின் அனைத்து பயண விவரங்களையும் கண்டறிந்துவிட்டோம்.",
  detailsRedirecting: "மதிப்பாய்வுக்கு திருப்பி விடப்படுகிறது...",
  popupAdultsSub: "12 வயதிற்கு மேல்",
  popupChildrenSub: "0 முதல் 12 வயது",
};

const strings: Record<string, LangStrings> = {
  en: enStrings,
  hi: hiStrings,
  ta: taStrings,
  te: enStrings, // Fallbacks
  kn: enStrings,
  ml: enStrings,
  bn: enStrings,
  mr: enStrings,
  auto: enStrings,
};

/**
 * Retrieves a localised string for the given language and key.
 * Falls back to English if the key is missing in the requested language.
 *
 * @param lang - The language code to look up (e.g. 'ta', 'hi', 'en')
 * @param key  - The string key from LangStrings interface
 * @returns The localised string, or the English fallback if not found
 */
export function t(lang: SupportedLang, key: keyof LangStrings): string {
  return strings[lang]?.[key] ?? strings['en'][key];
}

/** Global list of all AssemblyAI supported languages with their symbols, English, and native names. */
export const LANGUAGE_OPTIONS = [
  { code: "auto", nameEn: "Auto-detect", nameNative: "Auto-detect", symbol: "Auto" },
  { code: "en", nameEn: "English", nameNative: "English", symbol: "EN" },
  { code: "es", nameEn: "Spanish", nameNative: "Español", symbol: "ES" },
  { code: "fr", nameEn: "French", nameNative: "Français", symbol: "FR" },
  { code: "de", nameEn: "German", nameNative: "Deutsch", symbol: "DE" },
  { code: "it", nameEn: "Italian", nameNative: "Italiano", symbol: "IT" },
  { code: "pt", nameEn: "Portuguese", nameNative: "Português", symbol: "PT" },
  { code: "hi", nameEn: "Hindi", nameNative: "हिंदी", symbol: "हि" },
  { code: "ta", nameEn: "Tamil", nameNative: "தமிழ்", symbol: "த" },
  { code: "te", nameEn: "Telugu", nameNative: "తెలుగు", symbol: "తె" },
  { code: "kn", nameEn: "Kannada", nameNative: "ಕನ್ನಡ", symbol: "ಕ" },
  { code: "ml", nameEn: "Malayalam", nameNative: "മലയാളம்", symbol: "ம" },
  { code: "bn", nameEn: "Bengali", nameNative: "বাংলা", symbol: "বা" },
  { code: "mr", nameEn: "Marathi", nameNative: "मराठी", symbol: "म" },
  { code: "gu", nameEn: "Gujarati", nameNative: "ગુજરાતી", symbol: "ગુ" },
  { code: "pa", nameEn: "Punjabi", nameNative: "ਪੰਜਾਬੀ", symbol: "ਪੰ" },
  { code: "or", nameEn: "Odia", nameNative: "ଓଡ଼ିଆ", symbol: "ଓ" },
  { code: "as", nameEn: "Assamese", nameNative: "অসমীயா", symbol: "অ" },
  { code: "ur", nameEn: "Urdu", nameNative: "اردو", symbol: "ار" },
  { code: "ja", nameEn: "Japanese", nameNative: "日本語", symbol: "JA" },
  { code: "ko", nameEn: "Korean", nameNative: "한국어", symbol: "KO" },
  { code: "zh", nameEn: "Chinese", nameNative: "中文", symbol: "ZH" },
  { code: "ru", nameEn: "Russian", nameNative: "Русский", symbol: "RU" },
  { code: "ar", nameEn: "Arabic", nameNative: "العربية", symbol: "AR" },
  { code: "tr", nameEn: "Turkish", nameNative: "Türkçe", symbol: "TR" },
  { code: "nl", nameEn: "Dutch", nameNative: "Nederlands", symbol: "NL" },
  { code: "pl", nameEn: "Polish", nameNative: "Polski", symbol: "PL" },
  { code: "sv", nameEn: "Swedish", nameNative: "Svenska", symbol: "SV" },
  { code: "da", nameEn: "Danish", nameNative: "Dansk", symbol: "DA" },
  { code: "fi", nameEn: "Finnish", nameNative: "Suomi", symbol: "FI" },
  { code: "no", nameEn: "Norwegian", nameNative: "Norsk", symbol: "NO" },
  { code: "cs", nameEn: "Czech", nameNative: "Čeština", symbol: "CS" },
  { code: "el", nameEn: "Greek", nameNative: "Ελληνικά", symbol: "EL" },
  { code: "he", nameEn: "Hebrew", nameNative: "עברית", symbol: "HE" },
  { code: "id", nameEn: "Indonesian", nameNative: "Bahasa Indonesia", symbol: "ID" },
  { code: "ms", nameEn: "Malay", nameNative: "Bahasa Melayu", symbol: "MS" },
  { code: "th", nameEn: "Thai", nameNative: "ไทย", symbol: "TH" },
  { code: "vi", nameEn: "Vietnamese", nameNative: "Tiếng Việt", symbol: "VI" },
  { code: "uk", nameEn: "Ukrainian", nameNative: "Українська", symbol: "UK" },
  { code: "ro", nameEn: "Romanian", nameNative: "Română", symbol: "RO" },
  { code: "hu", nameEn: "Hungarian", nameNative: "Magyar", symbol: "HU" },
  { code: "sk", nameEn: "Slovak", nameNative: "Slovenčina", symbol: "SK" },
  { code: "bg", nameEn: "Bulgarian", nameNative: "Български", symbol: "BG" },
  { code: "hr", nameEn: "Croatian", nameNative: "Hrvatski", symbol: "HR" },
  { code: "sr", nameEn: "Serbian", nameNative: "Српски", symbol: "SR" },
  { code: "sl", nameEn: "Slovenian", nameNative: "Slovenščina", symbol: "SL" },
  { code: "et", nameEn: "Estonian", nameNative: "Eesti", symbol: "ET" },
  { code: "lv", nameEn: "Latvian", nameNative: "Latviešu", symbol: "LV" },
  { code: "lt", nameEn: "Lithuanian", nameNative: "Lietuvių", symbol: "LT" },
  { code: "fa", nameEn: "Persian", nameNative: "فارسی", symbol: "FA" },
  { code: "hy", nameEn: "Armenian", nameNative: "Հայերեն", symbol: "HY" },
  { code: "ka", nameEn: "Georgian", nameNative: "ქართული", symbol: "KA" },
  { code: "af", nameEn: "Afrikaans", nameNative: "Afrikaans", symbol: "AF" },
  { code: "sq", nameEn: "Albanian", nameNative: "Shqip", symbol: "SQ" },
  { code: "am", nameEn: "Amharic", nameNative: "አማርኛ", symbol: "AM" },
  { code: "az", nameEn: "Azerbaijani", nameNative: "Azərbaycanca", symbol: "AZ" },
  { code: "eu", nameEn: "Basque", nameNative: "Euskara", symbol: "EU" },
  { code: "be", nameEn: "Belarusian", nameNative: "Беларуская", symbol: "BE" },
  { code: "bs", nameEn: "Bosnian", nameNative: "Bosanski", symbol: "BS" },
  { code: "ca", nameEn: "Catalan", nameNative: "Català", symbol: "CA" },
  { code: "gl", nameEn: "Galician", nameNative: "Galego", symbol: "GL" },
  { code: "is", nameEn: "Icelandic", nameNative: "Íslenska", symbol: "IS" },
  { code: "kk", nameEn: "Kazakh", nameNative: "Қазақ тілі", symbol: "KK" },
  { code: "ky", nameEn: "Kyrgyz", nameNative: "Кыргызча", symbol: "KY" },
  { code: "mk", nameEn: "Macedonian", nameNative: "Македонски", symbol: "MK" },
  { code: "mn", nameEn: "Mongolian", nameNative: "Монгол", symbol: "MN" },
  { code: "ne", nameEn: "Nepali", nameNative: "नेपाली", symbol: "NE" },
  { code: "si", nameEn: "Sinhala", nameNative: "சிங்களம்", symbol: "SI" },
  { code: "sw", nameEn: "Swahili", nameNative: "Kiswahili", symbol: "SW" },
  { code: "uz", nameEn: "Uzbek", nameNative: "Oʻzbekcha", symbol: "UZ" },
  { code: "cy", nameEn: "Welsh", nameNative: "Cymraeg", symbol: "CY" },
  { code: "yo", nameEn: "Yoruba", nameNative: "Yorùbá", symbol: "YO" },
  { code: "zu", nameEn: "Zulu", nameNative: "isiZulu", symbol: "ZU" }
] as const;
