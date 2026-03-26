import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectdb from "./config/db.js";
import errorhendeller from "./middleware/errorhendeller.js";
import authRoute from "./routes/authroute.js";
import sessionRoutes from "./routes/SessionRoute.js";

dotenv.config();

const app = express();

//  PORT fallback
const PORT = process.env.PORT || 5000;

//  Connect DB
connectdb();

//  CORS config (FIXED)
const corsOption = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, //  FIXED (important!)
};

//  Middlewares
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/session", sessionRoutes);

//  Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Live class server is running",
    timeStamp: new Date().toISOString(),
  });
});

//  Routes
app.use("/api/auth", authRoute);

//  Error handler (always last)
app.use(errorhendeller);

//  Server start
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL}`);
});