import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("⚠️ MONGO_URI not found. Running without database connection.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "MannSakhaAI",
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    console.log("⚠️ Running without database connection due to error.");
    // process.exit(1); // Don't exit, allow running in demo mode
  }
};

export default connectDB;
