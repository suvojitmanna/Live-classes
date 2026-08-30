import mongoose from "mongoose";

const connectdb = async () => {
  try {
    console.log(
      "MONGO_URI:",
      process.env.MONGO_URI?.replace(/\/\/.*@/, "/*:***@")
    );

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB error:", error.message);
    process.exit(1);
  }
};

export default connectdb;