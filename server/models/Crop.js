const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    season: { type: String, enum: ["Kharif", "Rabi", "Zaid", "All Season"], required: true },
    duration: { type: String, required: true }, // e.g. "90-120 days"
    regions: [{ type: String }],                // e.g. ["Maharashtra", "Punjab"]
    conditions: {
      soil:        { type: String },
      temperature: { type: String },
      rainfall:    { type: String },
      humidity:    { type: String },
    },
    description: { type: String },
    category:    { type: String, enum: ["Cereal", "Pulse", "Oilseed", "Vegetable", "Fruit", "Cash Crop"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
