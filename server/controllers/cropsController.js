const Crop = require("../models/Crop");

// In-memory cache: cacheKey → { crops, ts }
const cropsCache = new Map();
const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cropsCache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.crops;
  return null;
}

// GET /api/crops — all crops (with optional filters)
exports.getCrops = async (req, res, next) => {
  try {
    const { season, region, category, search } = req.query;
    const query = {};

    if (season)   query.season = season;
    if (category) query.category = category;
    if (region)   query.regions = { $in: [new RegExp(region, "i")] };
    if (search)   query.name = { $regex: search, $options: "i" };

    const cacheKey = JSON.stringify(query);
    const cached   = getCached(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, count: cached.length, crops: cached, fromCache: true });
    }

    const crops = await Crop.find(query).sort({ name: 1 });
    cropsCache.set(cacheKey, { crops, ts: Date.now() });
    res.status(200).json({ success: true, count: crops.length, crops });
  } catch (err) {
    next(err);
  }
};

// GET /api/crops/:id — single crop
exports.getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ success: false, message: "Crop not found" });
    res.status(200).json({ success: true, crop });
  } catch (err) {
    next(err);
  }
};
