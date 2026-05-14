const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const axios = require("axios");
const Groq  = require("groq-sdk");

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// ════════════════════════════════════════════════════════════
// ██  IN-MEMORY CACHE  ██
// Key: "commodity|state" → { data, timestamp }
// TTL: 5 minutes for fresh data, stale data kept as fallback.
// In production, migrate to Redis.
// ════════════════════════════════════════════════════════════
const CACHE_TTL_MS    = 5 * 60 * 1000;   // 5 min fresh window
const STALE_TTL_MS    = 60 * 60 * 1000;  // 1 hour before evicting stale
const mandiCache      = new Map();

function cacheKey(commodity, state) {
  return `${(commodity || "").toLowerCase().trim()}|${(state || "").toLowerCase().trim()}`;
}

function getCached(commodity, state) {
  const key = cacheKey(commodity, state);
  const entry = mandiCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age < CACHE_TTL_MS)  return { ...entry, fresh: true };
  if (age < STALE_TTL_MS)  return { ...entry, fresh: false };

  // Expired entirely
  mandiCache.delete(key);
  return null;
}

function setCache(commodity, state, data) {
  const key = cacheKey(commodity, state);
  mandiCache.set(key, { data, timestamp: Date.now() });

  // Evict oldest entries if cache grows too large (prevent memory leak)
  if (mandiCache.size > 200) {
    const oldest = [...mandiCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 50);
    oldest.forEach(([k]) => mandiCache.delete(k));
  }
}

// ════════════════════════════════════════════════════════════
// ██  RETRY WITH EXPONENTIAL BACKOFF  ██
// ════════════════════════════════════════════════════════════
const MAX_RETRIES     = 3;
const BASE_TIMEOUT_MS = 20000;  // 20s first attempt
const MAX_TIMEOUT_MS  = 45000;  // 45s final attempt

async function fetchWithRetry(url, params, retries = MAX_RETRIES) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const timeout = Math.min(BASE_TIMEOUT_MS * attempt, MAX_TIMEOUT_MS);
    const backoff = attempt > 1 ? Math.pow(2, attempt - 1) * 1000 : 0; // 0s, 2s, 4s

    if (backoff > 0) {
      console.log(`[Mandi] Retry ${attempt}/${retries} after ${backoff}ms backoff…`);
      await new Promise(r => setTimeout(r, backoff));
    }

    try {
      console.log(`[Mandi] Attempt ${attempt}/${retries} — timeout ${timeout}ms`);
      const response = await axios.get(url, { params, timeout });
      console.log(`[Mandi] ✓ Success on attempt ${attempt}`);
      return response;
    } catch (err) {
      lastError = err;
      const category = categorizeError(err);
      console.warn(`[Mandi] ✗ Attempt ${attempt} failed: ${category} — ${err.message}`);

      // Don't retry on client errors (4xx) — only on network/timeout/5xx
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        throw err;
      }
    }
  }

  throw lastError;
}

// ════════════════════════════════════════════════════════════
// ██  ERROR CATEGORIZATION  ██
// ════════════════════════════════════════════════════════════
function categorizeError(err) {
  if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) return "TIMEOUT";
  if (err.code === "ENOTFOUND")   return "DNS_FAILURE";
  if (err.code === "ECONNREFUSED") return "CONNECTION_REFUSED";
  if (err.code === "ECONNRESET")  return "CONNECTION_RESET";
  if (err.response?.status >= 500) return "SERVER_ERROR";
  if (err.response?.status === 429) return "RATE_LIMITED";
  if (err.response?.status >= 400) return "CLIENT_ERROR";
  return "UNKNOWN";
}

// User-friendly error messages — NEVER expose raw technical errors
const FRIENDLY_MESSAGES = {
  TIMEOUT:           "Government mandi servers are experiencing high load. We'll show you the latest available data.",
  DNS_FAILURE:       "Unable to reach market data servers. Please check your connection.",
  CONNECTION_REFUSED: "Market data service is temporarily unavailable.",
  CONNECTION_RESET:  "Connection to market servers was interrupted.",
  SERVER_ERROR:      "Government data servers are under maintenance. We'll show cached data if available.",
  RATE_LIMITED:      "Too many requests to market servers. Please wait a moment.",
  CLIENT_ERROR:      "There was an issue with the data request.",
  UNKNOWN:           "Market data is temporarily unavailable. Please try again shortly.",
};

// State name aliases — covers AGMARKNET / data.gov.in vs dropdown variants
const STATE_ALIASES = {
  "delhi":          ["delhi", "new delhi", "nct of delhi", "national capital territory of delhi", "delhi (nct)"],
  "uttarakhand":    ["uttarakhand", "uttaranchal"],
  "odisha":         ["odisha", "orissa"],
  "puducherry":     ["puducherry", "pondicherry"],
  "jammu & kashmir":["jammu & kashmir", "jammu and kashmir", "j&k"],
  "andaman & nicobar islands": ["andaman & nicobar islands", "andaman and nicobar"],
  "chhattisgarh":   ["chhattisgarh", "chattisgarh"],
  "telangana":      ["telangana", "telegana"],
  "tamil nadu":     ["tamil nadu", "tamilnadu"],
  "west bengal":    ["west bengal", "westbengal"],
  "andhra pradesh": ["andhra pradesh", "andhrapradesh"],
  "madhya pradesh": ["madhya pradesh", "madhyapradesh"],
  "uttar pradesh":  ["uttar pradesh", "uttarpradesh"],
  "himachal pradesh": ["himachal pradesh", "himachalpradesh"],
  "arunachal pradesh": ["arunachal pradesh", "arunachalpradesh"],
};

// Crop → states where it is commonly grown / traded in mandis.
// Used to reject geographically implausible combinations (e.g. Wheat in Odisha).
// Lightweight heuristic dataset — not exhaustive, but covers the dropdown crops.
const CROP_STATE_RELEVANCE = {
  "Wheat":     ["Punjab","Haryana","Uttar Pradesh","Madhya Pradesh","Rajasthan","Bihar","Gujarat","Maharashtra","Uttarakhand","Himachal Pradesh","Jammu & Kashmir","Delhi","West Bengal","Jharkhand","Chhattisgarh"],
  "Rice":      ["West Bengal","Punjab","Uttar Pradesh","Andhra Pradesh","Telangana","Tamil Nadu","Odisha","Bihar","Chhattisgarh","Assam","Karnataka","Kerala","Maharashtra","Madhya Pradesh","Jharkhand","Tripura","Manipur","Goa","Haryana","Gujarat","Meghalaya","Nagaland","Mizoram","Arunachal Pradesh","Sikkim","Puducherry"],
  "Cotton":    ["Gujarat","Maharashtra","Telangana","Andhra Pradesh","Karnataka","Madhya Pradesh","Punjab","Haryana","Rajasthan","Tamil Nadu","Odisha"],
  "Soybean":   ["Madhya Pradesh","Maharashtra","Rajasthan","Karnataka","Telangana","Chhattisgarh","Gujarat","Andhra Pradesh","Uttar Pradesh"],
  "Mustard":   ["Rajasthan","Haryana","Madhya Pradesh","Uttar Pradesh","West Bengal","Gujarat","Punjab","Bihar","Assam","Jharkhand","Chhattisgarh"],
  "Maize":     ["Karnataka","Madhya Pradesh","Bihar","Tamil Nadu","Telangana","Andhra Pradesh","Maharashtra","Rajasthan","Uttar Pradesh","Himachal Pradesh","Jammu & Kashmir","Punjab","Gujarat","West Bengal","Jharkhand","Odisha","Chhattisgarh","Uttarakhand"],
  "Tomato":    ["Andhra Pradesh","Karnataka","Maharashtra","Madhya Pradesh","Odisha","West Bengal","Gujarat","Bihar","Uttar Pradesh","Tamil Nadu","Telangana","Chhattisgarh","Jharkhand","Punjab","Haryana","Rajasthan","Himachal Pradesh","Assam","Kerala","Goa","Delhi","Uttarakhand","Tripura"],
  "Sugarcane": ["Uttar Pradesh","Maharashtra","Karnataka","Tamil Nadu","Bihar","Gujarat","Andhra Pradesh","Telangana","Haryana","Punjab","Uttarakhand","Madhya Pradesh","Odisha","Kerala"],
  "Onion":     ["Maharashtra","Karnataka","Madhya Pradesh","Gujarat","Bihar","Andhra Pradesh","Telangana","Tamil Nadu","Rajasthan","Haryana","Uttar Pradesh","Odisha","West Bengal","Punjab","Delhi"],
  "Potato":    ["Uttar Pradesh","West Bengal","Bihar","Gujarat","Madhya Pradesh","Punjab","Haryana","Karnataka","Maharashtra","Assam","Jharkhand","Himachal Pradesh","Uttarakhand","Tamil Nadu","Chhattisgarh","Odisha","Delhi"],
};

const norm = (s) => (s || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

function stateMatches(recordState, targetState) {
  if (!recordState || !targetState) return false;
  const rec = norm(recordState);
  const tgt = norm(targetState);
  if (rec === tgt) return true;

  // Check all alias lists — both directions
  for (const aliases of Object.values(STATE_ALIASES)) {
    const recInList = aliases.includes(rec);
    const tgtInList = aliases.includes(tgt);
    if (recInList && tgtInList) return true;
  }

  // Substring containment as last resort (e.g. "Delhi" in "NCT of Delhi")
  if (rec.includes(tgt) || tgt.includes(rec)) return true;

  return false;
}

function commodityMatches(recordCommodity, targetCommodity) {
  if (!targetCommodity) return true;
  if (!recordCommodity) return false;
  return norm(recordCommodity) === norm(targetCommodity);
}

function isCropRelevantInState(crop, state) {
  if (!crop || !state) return true;
  const list = CROP_STATE_RELEVANCE[crop];
  if (!list) return true; // unknown crop — let API decide
  return list.some(s => stateMatches(s, state));
}

// Crops commonly traded in a state — drives the "try another crop" suggestion
function cropsForState(state) {
  if (!state) return [];
  return Object.keys(CROP_STATE_RELEVANCE).filter(crop =>
    CROP_STATE_RELEVANCE[crop].some(s => stateMatches(s, state))
  );
}

// States where the crop is commonly traded — drives the "try another state" suggestion
function statesForCrop(crop) {
  return CROP_STATE_RELEVANCE[crop] || [];
}

function dedupeRecords(rows) {
  const seen = new Set();
  const out  = [];
  for (const r of rows) {
    const key = `${norm(r.market)}|${norm(r.district)}|${norm(r.state)}|${norm(r.commodity)}|${norm(r.variety)}|${norm(r.date)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

// ════════════════════════════════════════════════════════════
// ██  CORE DATA PROCESSING  ██
// Shared between live fetch and cache paths
// ════════════════════════════════════════════════════════════
function processRecords(records, commodity, state, limit) {
  // Strict filter: state match (mandatory if state provided), commodity match (defensive
  // against upstream returning unrelated commodities), and at least one valid price.
  const filtered = records.filter(r => {
    if (state && !stateMatches(r.state, state)) return false;
    if (commodity && !commodityMatches(r.commodity, commodity)) return false;
    const modal = parseFloat(r.modal_price);
    const min   = parseFloat(r.min_price);
    const max   = parseFloat(r.max_price);
    const hasValidPrice = (modal > 0) || (min > 0 && max > 0);
    if (!hasValidPrice) return false;
    return true;
  });

  const cleaned = dedupeRecords(filtered);

  return cleaned
    .map(r => ({
      market:     (r.market    || "").trim(),
      district:   (r.district  || "").trim(),
      state:      (r.state     || "").trim(),
      commodity:  (r.commodity || "").trim(),
      variety:    (r.variety   || "").trim(),
      minPrice:   parseFloat(r.min_price)   || 0,
      maxPrice:   parseFloat(r.max_price)   || 0,
      modalPrice: parseFloat(r.modal_price) || 0,
      date:       r.arrival_date || "",
    }))
    .sort((a, b) => b.modalPrice - a.modalPrice)
    .slice(0, parseInt(limit));
}


// GET /api/mandi/prices?commodity=Wheat&state=Maharashtra&limit=100
router.get("/prices", protect, async (req, res) => {
  try {
    const { commodity, state, limit = 100 } = req.query;
    const fetchedAt = new Date().toISOString();

    // Reject geographically implausible combinations BEFORE hitting upstream API.
    if (commodity && state && !isCropRelevantInState(commodity, state)) {
      return res.json({
        success:     true,
        prices:      [],
        total:       0,
        reason:      "not_relevant",
        commodity,
        state,
        suggestions: {
          crops:  cropsForState(state).slice(0, 6),
          states: statesForCrop(commodity).slice(0, 6),
        },
        fetchedAt,
      });
    }

    // ── Check cache first ──
    const cached = getCached(commodity, state);
    if (cached && cached.fresh) {
      console.log(`[Mandi] ✓ Cache HIT (fresh) for ${commodity}|${state}`);
      const prices = processRecords(cached.data, commodity, state, limit);
      return res.json({
        success:   true,
        prices,
        total:     prices.length,
        reason:    prices.length > 0 ? "ok" : "no_data",
        commodity: commodity || null,
        state:     state || null,
        source:    "cache",
        fetchedAt: new Date(cached.timestamp).toISOString(),
        suggestions: prices.length === 0 ? {
          crops:  state ? cropsForState(state).slice(0, 6) : [],
          states: commodity ? statesForCrop(commodity).slice(0, 6) : [],
        } : undefined,
      });
    }

    // ── Fetch from upstream API with retry ──
    // Pull a wide batch keyed only by commodity — state filter on the upstream
    // API is case-sensitive & state names diverge (e.g. "Delhi" vs "NCT of Delhi"),
    // so we filter server-side with case-insensitive + alias matching.
    const params = {
      "api-key": process.env.DATAGOV_KEY,
      format:    "json",
      limit:     1000,
    };
    if (commodity) params["filters[commodity]"] = commodity;
    // Also pass state as a hint — the API may or may not respect it
    if (state) params["filters[state]"] = state;

    let records = [];
    let source  = "live";

    try {
      const response = await fetchWithRetry(
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
        params
      );
      records = response.data.records || [];

      // Cache the raw records for future requests
      setCache(commodity, state, records);
      console.log(`[Mandi] Cached ${records.length} raw records for ${commodity}|${state}`);

    } catch (apiErr) {
      const category = categorizeError(apiErr);
      console.error(`[Mandi] All retries failed: ${category} — ${apiErr.message}`);

      // ── Fallback to stale cache ──
      if (cached && !cached.fresh) {
        console.log(`[Mandi] ⤷ Falling back to STALE cache (age: ${Math.round((Date.now() - cached.timestamp) / 60000)} min)`);
        records = cached.data;
        source  = "stale_cache";
      } else {
        // No cache available at all — return friendly error, NOT raw message
        return res.json({
          success:     false,
          prices:      [],
          total:       0,
          reason:      "api_unavailable",
          errorType:   category,
          message:     FRIENDLY_MESSAGES[category] || FRIENDLY_MESSAGES.UNKNOWN,
          commodity:   commodity || null,
          state:       state || null,
          fetchedAt,
          suggestions: {
            crops:  state ? cropsForState(state).slice(0, 6) : [],
            states: commodity ? statesForCrop(commodity).slice(0, 6) : [],
          },
        });
      }
    }

    // ── Process & strict-filter records ──
    const prices = processRecords(records, commodity, state, limit);

    if (prices.length === 0) {
      return res.json({
        success:     true,
        prices:      [],
        total:       0,
        reason:      "no_data",
        source,
        commodity:   commodity || null,
        state:       state || null,
        suggestions: {
          crops:  state ? cropsForState(state).slice(0, 6) : [],
          states: commodity ? statesForCrop(commodity).slice(0, 6) : [],
        },
        fetchedAt,
      });
    }

    res.json({
      success:   true,
      prices,
      total:     prices.length,
      reason:    "ok",
      source,
      commodity: commodity || null,
      state:     state || null,
      fetchedAt,
    });
  } catch (err) {
    // Catch-all: NEVER leak raw error messages to frontend
    console.error("[Mandi] Unexpected error in /prices:", err);
    res.json({
      success:   false,
      prices:    [],
      total:     0,
      reason:    "api_unavailable",
      message:   "Market data is temporarily unavailable. Please try again shortly.",
      fetchedAt: new Date().toISOString(),
    });
  }
});

// POST /api/mandi/predict
router.post("/predict", protect, async (req, res) => {
  try {
    const { commodity, priceData, state } = req.body;
    const groq = getGroq();

    const summary = (priceData || [])
      .slice(0, 10)
      .map(p => `${p.market}: ₹${p.modalPrice}`)
      .join(", ");

    const prompt = `You are an Indian agricultural commodity market analyst. Mandi price data for ${commodity} in ${state || "India"}: ${summary}. Current date: May 2026. Respond in this exact JSON format only (no extra text):
{"trend":"up","trendPercent":5,"confidence":72,"bestSellWindow":{"start":"15 May 2026","end":"30 May 2026"},"bestMarket":"market name","riskFactor":"brief risk description","summary":"under 50 word summary"}`;

    const completion = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      max_tokens:  400,
      temperature: 0.3,
    });

    const raw     = completion.choices[0].message.content;
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const s       = cleaned.indexOf("{");
    const e       = cleaned.lastIndexOf("}");
    const prediction = JSON.parse(cleaned.slice(s, e + 1).replace(/[\x00-\x1F\x7F-\x9F]/g, ""));

    res.json({ success: true, prediction });
  } catch (err) {
    console.error("Mandi predict error:", err.message);
    res.status(500).json({ success: false, message: "AI analysis temporarily unavailable. Please try again." });
  }
});

module.exports = router;
