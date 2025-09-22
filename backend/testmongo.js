require("dotenv").config();

const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URL;

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
