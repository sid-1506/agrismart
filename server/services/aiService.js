const Groq = require("groq-sdk");

const LANG_INSTRUCTIONS = {
  English: "Respond in English only.",
  Hindi:   "हिंदी में जवाब दें। केवल हिंदी में।",
  Marathi: "मराठीत उत्तर द्या. फक्त मराठीत.",
  Gujarati:"ગુજરાતીમાં જ જવાબ આપો.",
  Tamil:   "தமிழில் மட்டுமே பதில் அளியுங்கள்.",
  Telugu:  "తెలుగులో మాత్రమే సమాధానం ఇవ్వండి.",
  Kannada: "ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ.",
  Bengali: "শুধুমাত্র বাংলায় উত্তর দিন।",
};

const buildSystemPrompt = (lang, location) => {
  const instruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.English;
  return `${instruction}

You are AgriSmart AI, an expert farming assistant for Indian agriculture.

USER PROFILE:
- Location: ${location || "India"}
- Preferred Language: ${lang || "English"}

LANGUAGE RULES (HIGHEST PRIORITY):
1. DETECT the script/language the user is writing in from their message.
2. ALWAYS reply in the SAME language the user wrote their message in — no exceptions.
   - If user writes in Hindi (Devanagari) → reply entirely in Hindi
   - If user writes in Bengali → reply entirely in Bengali
   - If user writes in Tamil → reply entirely in Tamil
   - If user writes in Telugu → reply entirely in Telugu
   - If user writes in Kannada → reply entirely in Kannada
   - If user writes in Gujarati → reply entirely in Gujarati
   - If user writes in Marathi → reply entirely in Marathi
   - If user writes in English → reply in English
3. NEVER force English if the user wrote in another language.
4. NEVER mix languages in a single response.

CONTENT RULES:
5. Give practical, actionable advice for Indian farming conditions
6. Use bullet points or numbered lists
7. Keep language simple and farmer-friendly
8. Stay on agriculture topics only (crops, soil, pests, irrigation, fertilisers, seasons, equipment)
9. Be encouraging and supportive`;
};

const getGroqClient = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set in environment");
  return new Groq({ apiKey: key });
};

// ─────────────────────────────────────────
//  Chat reply
// ─────────────────────────────────────────
exports.generateChatReply = async ({ message, history = [], lang, location }) => {
  const groq = getGroqClient();
  const systemPrompt = buildSystemPrompt(lang, location);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map(m => ({
      role:    m.role === "ai" ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const completion = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages,
    max_tokens:  800,
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
};

// ─────────────────────────────────────────
//  Farming plan generation
// ─────────────────────────────────────────
exports.generateFarmingPlan = async ({ cropName, location, season }) => {
  const groq = getGroqClient();

  const prompt = `You are an expert Indian agricultural advisor.
Create a farming plan for ${cropName} in ${location || "India"} during ${season || "current"} season.

Respond with ONLY raw JSON — no markdown fences, no explanation.

{
  "cropName": "${cropName}",
  "season": "${season || "Kharif"}",
  "duration": "e.g. 90 to 120 days",
  "aiPlan": "2-sentence strategy summary.",
  "timeline": [
    { "title": "Land Preparation",     "description": "...", "date": "Week 1",    "done": false },
    { "title": "Sowing",               "description": "...", "date": "Week 2",    "done": false },
    { "title": "First Irrigation",     "description": "...", "date": "Week 3",    "done": false },
    { "title": "Fertiliser Application","description": "...", "date": "Week 4-5", "done": false },
    { "title": "Pest Management",      "description": "...", "date": "Week 6-7",  "done": false },
    { "title": "Mid-season Care",      "description": "...", "date": "Week 8-10", "done": false },
    { "title": "Harvest",              "description": "...", "date": "Week 12-16","done": false }
  ]
}`;

  const completion = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    max_tokens:  2048,
    temperature: 0.7,
  });

  const raw = completion.choices[0].message.content;

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response");

  const plan = JSON.parse(
    cleaned.slice(start, end + 1).replace(/[\x00-\x1F\x7F-\x9F]/g, "")
  );

  if (!plan.cropName || !Array.isArray(plan.timeline) || plan.timeline.length === 0) {
    throw new Error("Invalid plan structure from AI");
  }

  plan.timeline = plan.timeline.map(s => ({ ...s, done: false }));
  return plan;
};

// ─────────────────────────────────────────
//  Disease detection (vision)
// ─────────────────────────────────────────
exports.analyzeCropDisease = async ({ imageBase64, cropName, lang }) => {
  const groq = getGroqClient();
  const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.English;

  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${langInstruction} You are an expert in crop disease identification for Indian agriculture.

Analyze this image of ${cropName || "a crop"} for diseases, pests, or nutrient deficiencies.

Provide a structured diagnosis in ${lang || "English"} with:
1. **Disease/Issue Name** — what you detected
2. **Severity** — Mild / Moderate / Severe
3. **Cause** — what causes this issue
4. **Symptoms Observed** — what you see in the image
5. **Treatment Steps** — actionable treatment plan
6. **Prevention Tips** — how to avoid recurrence`,
          },
          {
            type:      "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 800,
  });

  return completion.choices[0].message.content;
};

// ─────────────────────────────────────────
//  Yield & Profit Estimator
// ─────────────────────────────────────────
exports.generateYieldEstimate = async ({ cropName, landArea, landUnit, state, season, investment }) => {
  const groq = getGroqClient();

  const prompt = `You are an expert Indian agricultural economist with deep knowledge of Indian crop markets, MSP prices, and regional farming conditions.

A farmer needs a profitability analysis for their farm:
- Crop: ${cropName}
- Land Area: ${landArea} ${landUnit}
- State/Region: ${state || "India"}
- Season: ${season || "Kharif"}
${investment ? `- Investment Budget: ₹${investment}` : ""}

Use real Indian agricultural data for ${state || "India"}. All monetary values in INR (₹).

Respond with ONLY valid raw JSON — no markdown, no explanation:
{
  "cropName": "${cropName}",
  "expectedYieldPerUnit": <realistic yield per ${landUnit} in quintals>,
  "yieldUnit": "quintals per ${landUnit}",
  "totalExpectedYield": <total yield in quintals>,
  "marketPriceMin": <min mandi price per quintal INR>,
  "marketPriceMax": <max mandi price per quintal INR>,
  "avgMarketPrice": <average mandi price per quintal INR>,
  "grossRevenue": <totalExpectedYield * avgMarketPrice>,
  "estimatedExpenses": {
    "seeds": <INR>,
    "fertilizer": <INR>,
    "irrigation": <INR>,
    "labor": <INR>,
    "pesticides": <INR>,
    "other": <INR>,
    "total": <sum of all above>
  },
  "netProfit": <grossRevenue minus estimatedExpenses.total>,
  "roi": <integer: netProfit / estimatedExpenses.total * 100>,
  "profitability": "High" or "Medium" or "Low" or "Loss",
  "riskLevel": "Low" or "Medium" or "High",
  "risks": ["concise risk 1", "concise risk 2", "concise risk 3"],
  "recommendations": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "alternatives": [
    { "crop": "Name", "netProfit": <INR>, "roi": <int>, "brief": "one-line reason" },
    { "crop": "Name", "netProfit": <INR>, "roi": <int>, "brief": "one-line reason" }
  ],
  "bestSellMonth": "Month–Month string",
  "mspInfo": "MSP for ${cropName} is approximately ₹X per quintal (current season)",
  "govtSchemes": ["PM-KISAN", "PMFBY", "e-NAM"]
}`;

  const completion = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    max_tokens:  1400,
    temperature: 0.25,
  });

  const raw = completion.choices[0].message.content;

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response");

  const result = JSON.parse(
    cleaned.slice(start, end + 1).replace(/[\x00-\x1F\x7F-\x9F]/g, "")
  );

  if (!result.cropName || !result.grossRevenue) {
    throw new Error("Invalid yield estimate structure from AI");
  }

  return result;
};

exports.LANG_INSTRUCTIONS = LANG_INSTRUCTIONS;
exports.buildSystemPrompt = buildSystemPrompt;
