/**
 * Language Utility
 * Maps language names to Speech Recognition codes and ISO codes
 */

export const LANGUAGES = {
  English: {
    code: 'en-IN',
    isoCode: 'en',
    label: 'English',
    flag: '🇮🇳',
    nativeName: 'English',
  },
  Hindi: {
    code: 'hi-IN',
    isoCode: 'hi',
    label: 'हिंदी',
    flag: '🇮🇳',
    nativeName: 'हिंदी',
  },
  Marathi: {
    code: 'mr-IN',
    isoCode: 'mr',
    label: 'मराठी',
    flag: '🇮🇳',
    nativeName: 'मराठी',
  },
  Gujarati: {
    code: 'gu-IN',
    isoCode: 'gu',
    label: 'ગુજરાતી',
    flag: '🇮🇳',
    nativeName: 'ગુજરાતી',
  },
};

export const LANGUAGES_EXTRA = {
  Tamil: {
    code: 'ta-IN', isoCode: 'ta', label: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்',
  },
  Telugu: {
    code: 'te-IN', isoCode: 'te', label: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు',
  },
  Kannada: {
    code: 'kn-IN', isoCode: 'kn', label: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ',
  },
  Bengali: {
    code: 'bn-IN', isoCode: 'bn', label: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা',
  },
};

const ALL_LANGUAGES = { ...LANGUAGES, ...LANGUAGES_EXTRA };

export const LANGUAGE_LIST = [
  { key: 'English',  label: 'English',   code: 'en' },
  { key: 'Hindi',    label: 'हिंदी',      code: 'hi' },
  { key: 'Marathi',  label: 'मराठी',      code: 'mr' },
  { key: 'Gujarati', label: 'ગુજરાતી',   code: 'gu' },
  { key: 'Tamil',    label: 'தமிழ்',     code: 'ta' },
  { key: 'Telugu',   label: 'తెలుగు',    code: 'te' },
  { key: 'Kannada',  label: 'ಕನ್ನಡ',    code: 'kn' },
  { key: 'Bengali',  label: 'বাংলা',     code: 'bn' },
];

/**
 * Get speech recognition code for language
 * @param {string} language - Language name (e.g., 'Hindi')
 * @returns {string} - Speech recognition code (e.g., 'hi-IN')
 */
export const getLanguageCode = (language = 'English') => {
  return ALL_LANGUAGES[language]?.code || 'en-IN';
};

/**
 * Get ISO code for language
 * @param {string} language - Language name
 * @returns {string} - ISO code (e.g., 'hi')
 */
export const getISOCode = (language = 'English') => {
  return ALL_LANGUAGES[language]?.isoCode || 'en';
};

export const getLanguageFromISO = (isoCode) => {
  const entry = Object.entries(ALL_LANGUAGES).find(([_, lang]) => lang.isoCode === isoCode);
  return entry ? entry[0] : 'English';
};

export const getNativeLanguageLabel = (language) => {
  return ALL_LANGUAGES[language]?.nativeName || language;
};

// Detect language from text using Unicode script ranges.
// Returns a language name string (matching LANGUAGES keys) or null if inconclusive.
// Note: Hindi and Marathi share Devanagari script — Marathi is identified by
// distinctive conjuncts/vowels (ळ, ऱ, ऴ) that are rare in standard Hindi.
export const detectLanguage = (text) => {
  if (!text || text.trim().length < 3) return null;

  const nonSpace = text.replace(/\s/g, "");
  const total = nonSpace.length;
  if (total === 0) return null;

  const devanagari = (text.match(/[ऀ-ॿ]/g) || []).length;
  const bengali    = (text.match(/[ঀ-৿]/g) || []).length;
  const gujarati   = (text.match(/[઀-૿]/g) || []).length;
  const tamil      = (text.match(/[஀-௿]/g) || []).length;
  const telugu     = (text.match(/[ఀ-౿]/g) || []).length;
  const kannada    = (text.match(/[ಀ-೿]/g) || []).length;

  // Marathi-specific Devanagari chars: ळ (U+0933), ऱ (U+0931), ऴ (U+0934)
  const marathiMarkers = (text.match(/[ळऱऴ]/g) || []).length;

  const scores = {
    Bengali:  bengali,
    Gujarati: gujarati,
    Tamil:    tamil,
    Telugu:   telugu,
    Kannada:  kannada,
  };

  // Resolve Devanagari → Marathi or Hindi
  if (devanagari > 0) {
    if (marathiMarkers > 0) {
      scores.Marathi = devanagari;
    } else {
      scores.Hindi = devanagari;
    }
  }

  const [topLang, topCount] = Object.entries(scores).reduce(
    (best, cur) => (cur[1] > best[1] ? cur : best),
    ["", 0]
  );

  return topCount / total >= 0.3 ? topLang : null;
};
