const express    = require("express");
const router     = express.Router();
const { protect } = require("../middleware/auth");
const { estimateYield } = require("../controllers/yieldController");

// POST /api/yield  — body: { cropName, landArea, landUnit, state, season, investment }
router.post("/", protect, estimateYield);

module.exports = router;
