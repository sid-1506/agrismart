const express    = require("express");
const router     = express.Router();
const { protect } = require("../middleware/auth");
const {
  chat,
  getChats,
  getChatById,
  deleteChat,
  generatePlan,
} = require("../controllers/chatController");

router.post("/",              protect, chat);
router.post("/ask",           protect, chat);          // backwards compat
router.get("/",               protect, getChats);
router.get("/:id",            protect, getChatById);
router.delete("/:id",         protect, deleteChat);
router.post("/generate-plan", protect, generatePlan);

module.exports = router;
