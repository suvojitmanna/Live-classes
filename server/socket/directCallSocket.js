import User from "../models/user.js";
import Call from "../models/Call.js";

const userSockets = new Map();
const socketToUser = new Map();
const activeCalls = new Map();
const userCallState = new Map();

export const isUserOnline = (userId) => {
  if (!userId) return false;
  const sockets = userSockets.get(userId.toString());
  return sockets && sockets.size > 0;
};
export const isUserBusy = (userId) => {
  if (!userId) return false;
  return userCallState.has(userId.toString());
};

export const getUserSocketIds = (userId) => {
  if (!userId) return [];
  const sockets = userSockets.get(userId.toString());
  return sockets ? Array.from(sockets) : [];
};

export const registerDirectCallSocket = (io, socket) => {
  socket.on("direct-call:register", ({ userId }) => {
    if (!userId) return;
    const uid = userId.toString();

    if (!userSockets.has(uid)) {
      userSockets.set(uid, new Set());
    }
    userSockets.get(uid).add(socket.id);
    socketToUser.set(socket.id, uid);

    socket.emit("direct-call:registered", { success: true, userId: uid });
  });

  socket.on("direct-call:initiate", async ({ targetEmail, callType }) => {
    const callerId = socketToUser.get(socket.id);
    if (!callerId) {
      socket.emit("direct-call:error", {
        code: "UNAUTHENTICATED",
        message: "You must be logged in to make direct calls.",
      });
      return;
    }

    if (!targetEmail || typeof targetEmail !== "string") {
      socket.emit("direct-call:error", {
        code: "INVALID_EMAIL",
        message: "Please provide a valid recipient email.",
      });
      return;
    }

    const cleanEmail = targetEmail.trim().toLowerCase();

    try {
      const caller = await User.findById(callerId);
      if (!caller) {
        socket.emit("direct-call:error", {
          code: "CALLER_NOT_FOUND",
          message: "Caller account not found.",
        });
        return;
      }

      if (caller.email.toLowerCase() === cleanEmail) {
        socket.emit("direct-call:error", {
          code: "CANNOT_CALL_SELF",
          message: "You cannot call yourself.",
        });
        return;
      }

      if (userCallState.has(callerId)) {
        socket.emit("direct-call:error", {
          code: "CALLER_BUSY",
          message: "You are already in another active call.",
        });
        return;
      }

      const receiver = await User.findOne({ email: cleanEmail });
      if (!receiver) {
        socket.emit("direct-call:error", {
          code: "USER_NOT_FOUND",
          message: `No registered user found with email "${cleanEmail}".`,
        });
        return;
      }

      const receiverId = receiver._id.toString();

      const receiverSockets = getUserSocketIds(receiverId);
      if (!receiverSockets || receiverSockets.length === 0) {
        socket.emit("direct-call:user-offline", {
          message: `${receiver.name || "User"} is currently offline.`,
          user: {
            id: receiver._id,
            name: receiver.name,
            email: receiver.email,
            avatar: receiver.avatar,
          },
        });
        return;
      }

      if (userCallState.has(receiverId)) {
        socket.emit("direct-call:user-busy", {
          message: `${receiver.name || "User"} is currently busy on another call.`,
          user: {
            id: receiver._id,
            name: receiver.name,
            email: receiver.email,
            avatar: receiver.avatar,
          },
        });
        return;
      }

      const callDoc = await Call.create({
        caller: caller._id,
        receiver: receiver._id,
        callType: callType === "voice" ? "voice" : "video",
        status: "missed",
        startedAt: new Date(),
      });

      const callId = callDoc._id.toString();

      activeCalls.set(callId, {
        callDocId: callDoc._id,
        callId,
        callerId,
        receiverId,
        callerSocketId: socket.id,
        receiverSocketId: receiverSockets[0],
        callType: callDoc.callType,
        startedAt: callDoc.startedAt,
        connectedAt: null,
      });

      userCallState.set(callerId, { callId, status: "ringing" });
      userCallState.set(receiverId, { callId, status: "ringing" });

      socket.emit("direct-call:outgoing-ringing", {
        callId,
        callType: callDoc.callType,
        receiver: {
          id: receiver._id,
          name: receiver.name,
          email: receiver.email,
          avatar: receiver.avatar,
        },
      });

      receiverSockets.forEach((sId) => {
        io.to(sId).emit("direct-call:incoming", {
          callId,
          callType: callDoc.callType,
          caller: {
            id: caller._id,
            name: caller.name,
            email: caller.email,
            avatar: caller.avatar,
          },
        });
      });
    } catch (err) {
      console.error("Direct call initiate error:", err);
      socket.emit("direct-call:error", {
        code: "SERVER_ERROR",
        message: "Failed to initiate call. Please try again.",
      });
    }
  });

  socket.on("direct-call:accept", async ({ callId }) => {
    if (!callId) return;
    const callData = activeCalls.get(callId);
    if (!callData) {
      socket.emit("direct-call:error", {
        code: "CALL_NOT_FOUND",
        message: "Call has expired or already ended.",
      });
      return;
    }

    try {
      const now = new Date();
      callData.connectedAt = now;
      callData.receiverSocketId = socket.id;

      userCallState.set(callData.callerId, { callId, status: "in-call" });
      userCallState.set(callData.receiverId, { callId, status: "in-call" });

      await Call.findByIdAndUpdate(callData.callDocId, {
        status: "completed",
        connectedAt: now,
      });

      io.to(callData.callerSocketId).emit("direct-call:accepted", {
        callId,
        targetSocketId: socket.id,
      });

      socket.emit("direct-call:connected", {
        callId,
        targetSocketId: callData.callerSocketId,
      });
    } catch (err) {
      console.error("Direct call accept error:", err);
    }
  });

  socket.on("direct-call:decline", async ({ callId, reason }) => {
    if (!callId) return;
    const callData = activeCalls.get(callId);

    if (callData) {
      try {
        await Call.findByIdAndUpdate(callData.callDocId, {
          status: "declined",
          endedAt: new Date(),
        });
      } catch (e) {}

      userCallState.delete(callData.callerId);
      userCallState.delete(callData.receiverId);
      activeCalls.delete(callId);

      io.to(callData.callerSocketId).emit("direct-call:declined", {
        callId,
        reason: reason || "Recipient declined the call.",
      });
    }
  });

  socket.on("direct-call:cancel", async ({ callId }) => {
    if (!callId) return;
    const callData = activeCalls.get(callId);

    if (callData) {
      try {
        await Call.findByIdAndUpdate(callData.callDocId, {
          status: "cancelled",
          endedAt: new Date(),
        });
      } catch (e) {}

      userCallState.delete(callData.callerId);
      userCallState.delete(callData.receiverId);
      activeCalls.delete(callId);

      const receiverSockets = getUserSocketIds(callData.receiverId);
      receiverSockets.forEach((sId) => {
        io.to(sId).emit("direct-call:cancelled", { callId });
      });
    }
  });
  socket.on("direct-call:offer", ({ callId, targetSocketId, sdp }) => {
    if (!targetSocketId || !sdp) return;
    io.to(targetSocketId).emit("direct-call:offer", {
      callId,
      callerSocketId: socket.id,
      sdp,
    });
  });

  socket.on("direct-call:answer", ({ callId, targetSocketId, sdp }) => {
    if (!targetSocketId || !sdp) return;
    io.to(targetSocketId).emit("direct-call:answer", {
      callId,
      answerSocketId: socket.id,
      sdp,
    });
  });

  socket.on(
    "direct-call:ice-candidate",
    ({ callId, targetSocketId, candidate }) => {
      if (!targetSocketId || !candidate) return;
      io.to(targetSocketId).emit("direct-call:ice-candidate", {
        callId,
        candidate,
      });
    },
  );

  socket.on(
    "direct-call:toggle-media",
    ({ callId, targetSocketId, isAudioMuted, isVideoOff, isScreenSharing }) => {
      if (!targetSocketId) return;
      io.to(targetSocketId).emit("direct-call:toggle-media", {
        callId,
        isAudioMuted,
        isVideoOff,
        isScreenSharing,
      });
    },
  );

  socket.on("direct-call:end", async ({ callId }) => {
    if (!callId) return;
    await terminateDirectCall(io, callId, "User ended call.");
  });

  socket.on("disconnect", async () => {
    const userId = socketToUser.get(socket.id);
    if (userId) {
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }
      socketToUser.delete(socket.id);

      for (const [callId, callData] of activeCalls.entries()) {
        if (
          callData.callerSocketId === socket.id ||
          callData.receiverSocketId === socket.id
        ) {
          await terminateDirectCall(io, callId, "Peer disconnected.");
        }
      }
    }
  });
};

const terminateDirectCall = async (io, callId, reason) => {
  const callData = activeCalls.get(callId);
  if (!callData) return;

  activeCalls.delete(callId);
  userCallState.delete(callData.callerId);
  userCallState.delete(callData.receiverId);

  const endedAt = new Date();
  let durationSeconds = 0;

  if (callData.connectedAt) {
    durationSeconds = Math.max(
      0,
      Math.round(
        (endedAt.getTime() - new Date(callData.connectedAt).getTime()) / 1000,
      ),
    );
  }

  try {
    await Call.findByIdAndUpdate(callData.callDocId, {
      endedAt,
      durationSeconds,
      ...(callData.connectedAt
        ? { status: "completed" }
        : { status: "failed" }),
    });
  } catch (err) {
    console.warn("Update call history on terminate error:", err.message);
  }

  io.to(callData.callerSocketId).emit("direct-call:ended", {
    callId,
    durationSeconds,
    reason,
  });

  io.to(callData.receiverSocketId).emit("direct-call:ended", {
    callId,
    durationSeconds,
    reason,
  });
};
