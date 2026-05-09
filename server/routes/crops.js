const express = require("express");
const router = express.Router();
const { getCrops, getCropById } = require("../controllers/cropsController");
const { protect } = require("../middleware/auth");

router.get("/",    protect, getCrops);
router.get("/:id", protect, getCropById);

module.exports = router;
