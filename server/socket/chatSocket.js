export const registerChatSocket = (io, socket) => {
  socket.on("send-chat-message", ({ roomId, text, sender }) => {
    if (!roomId || !text || !text.trim()) return;

    const normalizedRoomId = roomId.toLowerCase().trim();

    const chatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: {
        id: sender?.id || socket.id,
        name: sender?.name || "Participant",
        avatar: sender?.avatar || "",
      },
      text: text.trim().slice(0, 1000),
      timestamp: new Date().toISOString(),
    };

    io.to(normalizedRoomId).emit("receive-chat-message", chatMessage);
  });
};
