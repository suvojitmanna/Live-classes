import { Server } from "socket.io";
import { registerMeetingSocket } from "./meetingSocket.js";
import { registerChatSocket } from "./chatSocket.js";

let ioInstance = null;

export const initializeSocket = (httpServer) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(`🔌 [Socket.IO] New client connected: ${socket.id}`);

    // Register Handlers
    registerMeetingSocket(io, socket);
    registerChatSocket(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = () => ioInstance;
