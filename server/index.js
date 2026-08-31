import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectdb from "./config/db.js";
import errorHandler from "./middleware/errorhendeller.js";
import authRoute from "./routes/authroute.js";
import sessionRoutes from "./routes/SessionRoute.js";
import callRoutes from "./routes/callRoute.js";
import { initializeSocket } from "./socket/index.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;

connectdb();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
];

const corsOption = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = initializeSocket(httpServer);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Live Classes real-time WebRTC backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoute);
app.use("/api/session", sessionRoutes);
app.use("/api/call", callRoutes);

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🚀 Live Classes server is running on port ${PORT}`);
  console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`📹 WebRTC signaling & Socket.IO initialized`);
});