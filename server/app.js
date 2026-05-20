const express = require("express");
const cors = require("cors");
const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const passport = require("./config/passport");

const app = express();

const clientOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(cors({ origin: clientOrigins, credentials: true }));
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ limit: "4mb", extended: true }));
app.use(passport.initialize());

app.use("/api/auth",         require("./routes/auth"));
app.use("/api/crops",        require("./routes/crops"));
app.use("/api/plans",        require("./routes/plans"));
app.use("/api/chat",         require("./routes/chat"));
app.use("/api/weather",      require("./routes/weather"));
app.use("/api/disease",      require("./routes/disease"));
app.use("/api/yield",        require("./routes/yield"));
app.use("/api/intelligence", require("./routes/intelligence"));
app.use("/api/satellite",    require("./routes/satellite"));
app.use("/api/mandi",        require("./routes/mandi"));

app.get("/", (req, res) => res.json({ message: "AgriSmart API running" }));

app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Image too large — please use a smaller image." });
  }
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" });
});

module.exports = app;
