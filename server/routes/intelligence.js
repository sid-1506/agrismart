const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const axios = require("axios");
const Groq  = require("groq-sdk");

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseJSONObj = (raw) => {
  const cleaned = raw
    .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("No JSON object found");
  return JSON.parse(cleaned.slice(s, e + 1).replace(/[\x00-\x1F\x7F-\x9F]/g, ""));
};

const parseJSONArr = (raw) => {
  const cleaned = raw
    .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const s = cleaned.indexOf("[");
  const e = cleaned.lastIndexOf("]");
  if (s === -1 || e === -1) throw new Error("No JSON array found");
  return JSON.parse(cleaned.slice(s, e + 1).replace(/[\x00-\x1F\x7F-\x9F]/g, ""));
};

// GET /api/intelligence/weather?lat=XX&lon=XX
router.get("/weather", protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: "lat and lon required" });

    const key = process.env.OPENWEATHER_API_KEY;
    const [forecastRes, currentRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`),
    ]);

    const dailyMap = {};
    forecastRes.data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap[date]) dailyMap[date] = { date, temps: [], rain: 0, weather: item.weather[0] };
      dailyMap[date].temps.push(item.main.temp);
      dailyMap[date].rain += (item.rain?.["3h"] || 0);
    });

    const forecast = Object.values(dailyMap).slice(0, 7).map(d => ({
      date:    d.date,
      maxTemp: Math.round(Math.max(...d.temps)),
      minTemp: Math.round(Math.min(...d.temps)),
      rain:    Math.round(d.rain * 10) / 10,
      weather: d.weather,
    }));

    const c = currentRes.data;
    res.json({
      success: true,
      current: {
        temp:        Math.round(c.main.temp),
        feelsLike:   Math.round(c.main.feels_like),
        humidity:    c.main.humidity,
        windSpeed:   Math.round(c.wind.speed * 3.6),
        description: c.weather[0].description,
        icon:        c.weather[0].icon,
        rain:        c.rain?.["1h"] || 0,
        city:        c.name,
      },
      forecast,
    });
  } catch (err) {
    console.error("Weather error:", err.message);
    res.status(500).json({ success: false, message: "Weather data unavailable: " + err.message });
  }
});

// GET /api/intelligence/soil?lat=XX&lon=XX
router.get("/soil", protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: "lat and lon required" });

    const end   = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const fmt = d => d.toISOString().slice(0, 10).replace(/-/g, "");

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,RH2M,T2M,WS2M&community=AG&longitude=${lon}&latitude=${lat}&start=${fmt(start)}&end=${fmt(end)}&format=JSON`;
    const response = await axios.get(url, { timeout: 15000 });
    const params   = response.data.properties.parameter;

    const values = obj => Object.values(obj).filter(v => v !== -999);
    const avg    = arr => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

    const rainfall      = values(params.PRECTOTCORR);
    const humidity      = values(params.RH2M);
    const temp          = values(params.T2M);
    const totalRainfall = Math.round(rainfall.reduce((a, b) => a + b, 0) * 10) / 10;
    const soilMoisture  = Math.min(100, Math.round((avg(humidity) * 0.4) + (Math.min(totalRainfall, 100) * 0.6)));

    res.json({
      success: true,
      soil: {
        soilMoisture,
        avgRainfall:    avg(rainfall),
        totalRainfall30d: totalRainfall,
        avgHumidity:    avg(humidity),
        avgTemp:        avg(temp),
        interpretation: soilMoisture > 70 ? "Wet" : soilMoisture > 40 ? "Adequate" : "Dry",
      },
    });
  } catch (err) {
    console.error("Soil error:", err.message);
    res.status(500).json({ success: false, message: "Soil data unavailable: " + err.message });
  }
});

// POST /api/intelligence/advice
router.post("/advice", protect, async (req, res) => {
  try {
    const { weatherData, soilData, cropName, location } = req.body;
    const groq = getGroq();

    const prompt = `You are an expert Indian agricultural advisor. Based on real field conditions:
Weather: ${JSON.stringify(weatherData)}
Soil/Climate: ${JSON.stringify(soilData)}
Crop: ${cropName}
Location: ${location}

Give specific advice for TODAY in this exact JSON format only (no extra text):
{"irrigation":{"needed":true,"reason":"brief reason","priority":"high"},"pestRisk":{"risk":"medium","details":"brief details"},"fertilizer":{"needed":false,"timing":"timing string","priority":"low"},"criticalAction":{"action":"action string","deadline":"deadline string","priority":"high"},"fieldHealthScore":75}`;

    const completion = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      max_tokens:  600,
      temperature: 0.3,
    });

    const advice = parseJSONObj(completion.choices[0].message.content);
    res.json({ success: true, advice });
  } catch (err) {
    console.error("Advice error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/intelligence/calendar
router.post("/calendar", protect, async (req, res) => {
  try {
    const { cropName, weatherForecast, location } = req.body;
    const groq = getGroq();

    const today = new Date();
    const prompt = `You are an expert Indian agricultural advisor. Create a 7-day farming calendar starting ${today.toISOString().slice(0, 10)}.
Crop: ${cropName}, Location: ${location || "India"}
Weather: ${JSON.stringify((weatherForecast || []).slice(0, 7))}

Return ONLY a JSON array of exactly 7 objects (no extra text):
[{"day":"Thursday","date":"2026-05-01","temp":30,"rain":1.5,"weatherIcon":"01d","tasks":["Check soil moisture","Apply first irrigation"],"urgency":"moderate"}]
urgency must be one of: urgent, moderate, routine`;

    const completion = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      max_tokens:  900,
      temperature: 0.3,
    });

    const calendar = parseJSONArr(completion.choices[0].message.content);
    res.json({ success: true, calendar });
  } catch (err) {
    console.error("Calendar error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
