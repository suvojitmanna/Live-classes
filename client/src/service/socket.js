import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const rawUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_BASE_URL ||
      (window.location.port === "5173"
        ? "http://localhost:5000"
        : window.location.origin);

    // Strip trailing /api and any trailing slashes
    const socketUrl = rawUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

    console.log(`🔗 [Socket.IO] Connecting to WebSocket Server: ${socketUrl}`);

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log(`🔌 [Socket.IO Client] Connected with ID: ${socket.id}`);
    });

    socket.on("connect_error", (error) => {
      console.warn("⚠️ [Socket.IO Client] Connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 [Socket.IO Client] Disconnected: ${reason}`);
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
