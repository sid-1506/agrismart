const express = require("express");
const router = express.Router();
const { getMyPlans, getPlanById, createPlan, updateStep, deletePlan } = require("../controllers/plansController");
const { protect } = require("../middleware/auth");

router.use(protect); // all plan routes are protected

router.get("/",                       getMyPlans);
router.get("/:id",                    getPlanById);
router.post("/",                      createPlan);
router.patch("/:id/step/:stepId",     updateStep);
router.delete("/:id",                 deletePlan);

module.exports = router;
