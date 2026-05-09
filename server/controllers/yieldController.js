const { generateYieldEstimate } = require("../services/aiService");

exports.estimateYield = async (req, res) => {
  try {
    const { cropName, landArea, landUnit, state, season, investment } = req.body;

    if (!cropName?.trim()) {
      return res.status(400).json({ success: false, message: "cropName is required" });
    }
    if (!landArea || isNaN(parseFloat(landArea)) || parseFloat(landArea) <= 0) {
      return res.status(400).json({ success: false, message: "landArea must be a positive number" });
    }

    const result = await generateYieldEstimate({
      cropName:   cropName.trim(),
      landArea:   parseFloat(landArea),
      landUnit:   landUnit || "acres",
      state:      state || req.user?.location || "India",
      season:     season || "Kharif",
      investment: investment ? parseFloat(investment) : null,
    });

    return res.status(200).json({ success: true, result });

  } catch (err) {
    console.error("[yieldController] error:", err.message);
    const status = err?.response?.status;
    if (status === 429) {
      return res.status(429).json({ success: false, message: "AI rate limit — please wait a moment." });
    }
    return res.status(500).json({ success: false, message: err.message || "Estimation failed" });
  }
};
