const mongoose = require("mongoose");

// Cache the DB connection across serverless invocations
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  isConnected = true;
}

const app = require("../server/app");

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
