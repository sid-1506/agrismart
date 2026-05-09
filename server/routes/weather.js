const express    = require("express");
const router     = express.Router();
const { protect } = require("../middleware/auth");
const { getWeather } = require("../controllers/weatherController");

// GET /api/weather?lat=&lon=   or   ?city=Mumbai
router.get("/", protect, getWeather);

module.exports = router;
