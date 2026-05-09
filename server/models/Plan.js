const mongoose = require("mongoose");

const timelineStepSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: String },   // e.g. "Jun 8"
  done:        { type: Boolean, default: false },
  completedAt: { type: Date },
});

const planSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
    },
    cropName:  { type: String, required: true },
    season:    { type: String },
    location:  { type: String },
    startDate: { type: Date, default: Date.now },
    status:    { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
    timeline:  [timelineStepSchema],
    aiPlan:    { type: String }, // full AI-generated plan text
  },
  { timestamps: true }
);

// ── Virtual: progress percentage ──
planSchema.virtual("progress").get(function () {
  if (!this.timeline.length) return 0;
  const done = this.timeline.filter((s) => s.done).length;
  return Math.round((done / this.timeline.length) * 100);
});

planSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Plan", planSchema);
