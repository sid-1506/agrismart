const express    = require("express");
const router     = express.Router();
const { protect } = require("../middleware/auth");
const { detectDisease } = require("../controllers/diseaseController");

// POST /api/disease  — body: { imageBase64, cropName }
router.post("/", protect, detectDisease);

module.exports = router;
