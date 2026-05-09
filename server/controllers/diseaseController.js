const { analyzeCropDisease } = require("../services/aiService");

exports.detectDisease = async (req, res) => {
  try {
    const { imageBase64, cropName, lang: bodyLang } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "imageBase64 is required" });
    }

    // base64 length * 0.75 ≈ binary bytes
    if (imageBase64.length * 0.75 > 2 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: "Image too large — please use an image smaller than 2MB.",
      });
    }

    const lang = bodyLang || req.user?.language || "English";
    const analysis = await analyzeCropDisease({ imageBase64, cropName, lang });

    return res.status(200).json({ success: true, analysis });

  } catch (err) {
    console.error("[diseaseController] error:", err.message);
    const status = err?.response?.status;
    if (status === 429) {
      return res.status(429).json({ success: false, message: "AI rate limit — please wait a moment." });
    }
    return res.status(500).json({ success: false, message: err.message || "Analysis failed" });
  }
};
