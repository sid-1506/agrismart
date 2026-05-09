const Plan = require("../models/Plan");

// GET /api/plans — get all plans for logged-in user
exports.getMyPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, plans });
  } catch (err) {
    next(err);
  }
};

// GET /api/plans/:id — single plan
exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

// POST /api/plans — create a plan (AI-generated timeline saved here)
exports.createPlan = async (req, res, next) => {
  try {
    const { cropName, crop, season, location, timeline, aiPlan } = req.body;
    if (!cropName) return res.status(400).json({ success: false, message: "cropName is required" });

    const plan = await Plan.create({
      user: req.user.id,
      cropName, crop, season, location, timeline, aiPlan,
    });
    res.status(201).json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/plans/:id/step/:stepId — mark a timeline step done/undone
exports.updateStep = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    const stepIndex = plan.timeline.findIndex(
      (s) => s._id.toString() === req.params.stepId
    );
    if (stepIndex === -1) return res.status(404).json({ success: false, message: "Step not found" });

    const markingDone = req.body.done !== undefined ? req.body.done : !plan.timeline[stepIndex].done;

    if (markingDone) {
      // All steps before this one must already be done
      const allPreviousDone = plan.timeline.slice(0, stepIndex).every((s) => s.done);
      if (!allPreviousDone) {
        const firstIncomplete = plan.timeline.find((s) => !s.done);
        return res.status(400).json({
          success: false,
          message: `⚠️ Please complete "${firstIncomplete.title}" first before marking this step as done.`,
        });
      }
    } else {
      // Only the last completed step may be undone
      const hasLaterDone = plan.timeline.slice(stepIndex + 1).some((s) => s.done);
      if (hasLaterDone) {
        return res.status(400).json({
          success: false,
          message: "⚠️ Cannot undo this step while later steps are still marked as done.",
        });
      }
    }

    const step = plan.timeline[stepIndex];
    step.done = markingDone;
    step.completedAt = step.done ? new Date() : undefined;

    plan.status = plan.timeline.every((s) => s.done) ? "completed" : "active";

    await plan.save();
    res.status(200).json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/plans/:id
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, message: "Plan deleted" });
  } catch (err) {
    next(err);
  }
};
