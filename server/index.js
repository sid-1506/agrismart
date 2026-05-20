const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("[✓] MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`[→] Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("[✗] MongoDB connection failed:", err.message);
    process.exit(1);
  });
