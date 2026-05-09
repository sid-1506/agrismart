const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const axios = require("axios");
const Groq  = require("groq-sdk");

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// State name aliases — covers AGMARKNET / data.gov.in vs dropdown variants
const STATE_ALIASES = {
  "delhi":          ["delhi", "new delhi", "nct of delhi", "national capital territory of delhi", "delhi (nct)"],
  "uttarakhand":    ["uttarakhand", "uttaranchal"],
  "odisha":         ["odisha", "orissa"],
  "puducherry":     ["puducherry", "pondicherry"],
  "jammu & kashmir":["jammu & kashmir", "jammu and kashmir", "j&k"],
  "andaman & nicobar islands": ["andaman & nicobar islands", "andaman and nicobar"],
  "chhattisgarh":   ["chhattisgarh", "chattisgarh"],
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
  const aliases = STATE_ALIASES[tgt] || STATE_ALIASES[rec];
  if (aliases) return aliases.includes(rec) || aliases.includes(tgt);
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

    // Pull a wide batch keyed only by commodity — state filter on the upstream
    // API is case-sensitive & state names diverge (e.g. "Delhi" vs "NCT of Delhi"),
    // so we filter server-side with case-insensitive + alias matching.
    const params = {
      "api-key": process.env.DATAGOV_KEY,
      format:    "json",
      limit:     1000,
    };
    if (commodity) params["filters[commodity]"] = commodity;

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      { params, timeout: 15000 }
    );

    const records = response.data.records || [];

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

    const prices = cleaned
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

    if (prices.length === 0) {
      return res.json({
        success:     true,
        prices:      [],
        total:       0,
        reason:      "no_data",
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
      commodity: commodity || null,
      state:     state || null,
      fetchedAt,
    });
  } catch (err) {
    console.error("Mandi prices error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Mandi data unavailable: " + err.message });
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
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
