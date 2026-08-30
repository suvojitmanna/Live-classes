import Session from "../models/Session.js";
import { getIO } from "./index.js";

const rooms = new Map();
const socketLookup = new Map();
const roomHosts = new Map();
const pendingKnocks = new Map();

export const isRoomActive = (roomId) => {
  if (!roomId) return false;
  const normalized = roomId.toLowerCase().trim();
  return rooms.has(normalized) && rooms.get(normalized).size > 0;
};

export const getRoomParticipantCount = (roomId) => {
  if (!roomId) return 0;
  const normalized = roomId.toLowerCase().trim();
  return rooms.has(normalized) ? rooms.get(normalized).size : 0;
};

export const notifyMeetingDeleted = (roomId) => {
  if (!roomId) return;
  const normalized = roomId.toLowerCase().trim();
  const io = getIO();

  if (io) {
    io.to(normalized).emit("meeting-deleted", {
      roomId: normalized,
      message: "This meeting was deleted by the host.",
    });

    io.emit("session-deleted", {
      roomId: normalized,
    });
  }
  rooms.delete(normalized);
  pendingKnocks.delete(normalized);
  roomHosts.delete(normalized);

  console.log(`🗑️ [Meeting Deleted] Room ${normalized} removed and broadcast to all users.`);
};

export const registerMeetingSocket = (io, socket) => {
  socket.on("join-room", async ({ roomId, userId, userName, avatar, isMuted, isVideoOff }) => {
    if (!roomId || !userId) return;

    const normalizedRoomId = roomId.toLowerCase().trim();
    let actualIsHost = false;

    try {
      const session = await Session.findOne({
        roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
      });

      if (session) {
        if (session.isExpired && session.isExpired()) {
          socket.emit("link-expired-error", {
            message: "This meeting link has expired and is disabled by the host.",
          });
          return;
        }

        if (session.host.toString() === userId.toString()) {
          actualIsHost = true;
        }
      }
    } catch (err) {
      console.warn("DB verification error on join-room:", err.message);
    }

    socket.join(normalizedRoomId);

    if (!rooms.has(normalizedRoomId)) {
      rooms.set(normalizedRoomId, new Map());
    }

    const roomParticipants = rooms.get(normalizedRoomId);

    if (actualIsHost) {
      roomHosts.set(normalizedRoomId, socket.id);
    }

    const participantData = {
      socketId: socket.id,
      userId: userId.toString(),
      userName: userName || "Participant",
      avatar: avatar || "",
      isHost: actualIsHost,
      isMuted: !!isMuted,
      isVideoOff: !!isVideoOff,
      isScreenSharing: false,
      isHandRaised: false,
      joinedAt: new Date().toISOString(),
    };

    if (pendingKnocks.has(normalizedRoomId)) {
      pendingKnocks.get(normalizedRoomId).delete(socket.id);
    }

    const existingParticipants = [];
    roomParticipants.forEach((data, sId) => {
      if (sId !== socket.id) {
        existingParticipants.push(data);
      }
    });

    roomParticipants.set(socket.id, participantData);
    socketLookup.set(socket.id, {
      roomId: normalizedRoomId,
      userId: userId.toString(),
      isHost: actualIsHost,
    });

    console.log(
      `👤 [Socket] User "${userName}" (${socket.id}) ${actualIsHost ? "[HOST / CREATOR]" : "[PARTICIPANT]"} joined room: ${normalizedRoomId}. Total: ${roomParticipants.size}`
    );
    // Persist participant into database session record so it appears in their Recent Meetings
    try {
      const sessionDoc = await Session.findOne({
        roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
      });

      if (sessionDoc) {
        sessionDoc.status = "active";
        const pIdx = sessionDoc.participants.findIndex(
          (p) => p.userId.toString() === userId.toString()
        );

        if (pIdx >= 0) {
          sessionDoc.participants[pIdx].leftAt = null;
          sessionDoc.participants[pIdx].joinedAt = new Date();
          sessionDoc.participants[pIdx].isHost = actualIsHost;
          sessionDoc.participants[pIdx].userName = userName || sessionDoc.participants[pIdx].userName;
          sessionDoc.participants[pIdx].avatar = avatar || sessionDoc.participants[pIdx].avatar;
        } else {
          sessionDoc.participants.push({
            userId: userId.toString(),
            userName: userName || "Participant",
            avatar: avatar || "",
            isHost: actualIsHost,
            joinedAt: new Date(),
          });
        }

        await sessionDoc.save();
      }
    } catch (e) {
      console.warn("DB save on join-room error:", e.message);
    }

    socket.emit("all-users", {
      users: existingParticipants,
      isHost: actualIsHost,
    });

    if (actualIsHost && pendingKnocks.has(normalizedRoomId)) {
      const knocks = Array.from(pendingKnocks.get(normalizedRoomId).values());
      if (knocks.length > 0) {
        socket.emit("pending-knocks-sync", { knocks });
      }
    }

    socket.to(normalizedRoomId).emit("user-joined", {
      socketId: socket.id,
      userId: userId.toString(),
      userName: participantData.userName,
      avatar: participantData.avatar,
      isHost: actualIsHost,
      isMuted: participantData.isMuted,
      isVideoOff: participantData.isVideoOff,
      isHandRaised: participantData.isHandRaised,
    });

    io.to(normalizedRoomId).emit("room-participants-update", {
      participants: Array.from(roomParticipants.values()),
    });
  });

  socket.on("knock-to-join", async ({ roomId, user }) => {
    if (!roomId || !user) return;

    const normalizedRoomId = roomId.toLowerCase().trim();

    try {
      const session = await Session.findOne({
        roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
      });

      if (session) {
        if (session.isExpired && session.isExpired()) {
          socket.emit("knock-response", {
            status: "expired",
            message: "This meeting link has expired and is disabled by the host.",
          });
          return;
        }

        if (session.host.toString() === user.id?.toString()) {
          socket.emit("knock-response", { status: "admitted", isHost: true });
          return;
        }
      }
    } catch (e) { }

    if (!pendingKnocks.has(normalizedRoomId)) {
      pendingKnocks.set(normalizedRoomId, new Map());
    }

    const knockData = {
      socketId: socket.id,
      userId: user.id || socket.id,
      userName: user.name || "Guest Participant",
      avatar: user.avatar || "",
      requestedAt: new Date().toISOString(),
    };

    pendingKnocks.get(normalizedRoomId).set(socket.id, knockData);
    socketLookup.set(socket.id, { roomId: normalizedRoomId, userId: user.id });

    console.log(
      `🚪 [Knock] User "${knockData.userName}" (${socket.id}) is asking to join room: ${normalizedRoomId}`
    );

    const hostSocketId = roomHosts.get(normalizedRoomId);
    if (hostSocketId) {
      io.to(hostSocketId).emit("user-knocking", knockData);
    } else {
      socket.to(normalizedRoomId).emit("user-knocking", knockData);
    }
  });

  socket.on("host-decision", ({ roomId, targetSocketId, decision }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !targetSocketId) return;

    if (pendingKnocks.has(normalizedRoomId)) {
      pendingKnocks.get(normalizedRoomId).delete(targetSocketId);
    }

    if (decision === "admit") {
      console.log(`✅ [Host Decision] Admitted socket: ${targetSocketId} into room: ${normalizedRoomId}`);
      io.to(targetSocketId).emit("knock-response", {
        status: "admitted",
        roomId: normalizedRoomId,
      });
    } else {
      console.log(`❌ [Host Decision] Denied socket: ${targetSocketId} for room: ${normalizedRoomId}`);
      io.to(targetSocketId).emit("knock-response", {
        status: "denied",
        message: "The host denied your request to join this meeting.",
      });
    }

    const hostSocketId = roomHosts.get(normalizedRoomId);
    if (hostSocketId && pendingKnocks.has(normalizedRoomId)) {
      io.to(hostSocketId).emit("pending-knocks-sync", {
        knocks: Array.from(pendingKnocks.get(normalizedRoomId).values()),
      });
    }
  });

  socket.on("cancel-knock", ({ roomId }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (normalizedRoomId && pendingKnocks.has(normalizedRoomId)) {
      pendingKnocks.get(normalizedRoomId).delete(socket.id);
      const hostSocketId = roomHosts.get(normalizedRoomId);
      if (hostSocketId) {
        io.to(hostSocketId).emit("pending-knocks-sync", {
          knocks: Array.from(pendingKnocks.get(normalizedRoomId).values()),
        });
      }
    }
  });

  socket.on("set-link-expiration", async ({ roomId, minutes }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId) return;

    try {
      let expiresAt = null;
      let isLinkDisabled = false;

      if (minutes === 0) {
        isLinkDisabled = true;
        expiresAt = new Date();
      } else if (minutes > 0) {
        expiresAt = new Date(Date.now() + minutes * 60 * 1000);
      }

      await Session.findOneAndUpdate(
        { roomId: new RegExp(`^${normalizedRoomId}$`, "i") },
        {
          isLinkDisabled,
          expiresAt,
          status: isLinkDisabled ? "expired" : "active",
        }
      );

      console.log(
        `⏱️ [Link Expiration] Room ${normalizedRoomId} expiration set: ${isLinkDisabled ? "Disabled immediately" : `${minutes} minutes`
        }`
      );

      if (isLinkDisabled) {
        io.to(normalizedRoomId).emit("link-expired-error", {
          message: "This meeting has been ended and disabled by the host.",
        });
      }
    } catch (err) {
      console.warn("Set link expiration error:", err.message);
    }
  });

  socket.on("delete-meeting", async ({ roomId }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId) return;

    try {
      const session = await Session.findOne({
        roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
      });

      const lookup = socketLookup.get(socket.id);
      if (session && (!lookup?.userId || session.host.toString() === lookup.userId.toString())) {
        await Session.deleteOne({ _id: session._id });
        notifyMeetingDeleted(normalizedRoomId);
      }
    } catch (err) {
      console.warn("Socket delete-meeting error:", err.message);
    }
  });

  socket.on("offer", ({ target, caller, sdp, callerInfo }) => {
    const lookup = socketLookup.get(socket.id);
    const roomParticipants = lookup?.roomId ? rooms.get(lookup.roomId) : null;
    const callerData = roomParticipants?.get(socket.id);

    const verifiedCallerInfo = {
      ...callerInfo,
      isHost: callerData ? !!callerData.isHost : !!lookup?.isHost,
    };

    io.to(target).emit("offer", {
      caller: socket.id,
      sdp,
      callerInfo: verifiedCallerInfo,
    });
  });

  socket.on("answer", ({ target, caller, sdp }) => {
    io.to(target).emit("answer", {
      caller: socket.id,
      sdp,
    });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", {
      caller: socket.id,
      candidate,
    });
  });

  socket.on("toggle-audio", ({ roomId, isMuted }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !rooms.has(normalizedRoomId)) return;

    const participant = rooms.get(normalizedRoomId).get(socket.id);
    if (participant) {
      participant.isMuted = isMuted;
      socket.to(normalizedRoomId).emit("user-toggle-audio", {
        socketId: socket.id,
        userId: participant.userId,
        isMuted,
      });
    }
  });

  socket.on("toggle-video", ({ roomId, isVideoOff }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !rooms.has(normalizedRoomId)) return;

    const participant = rooms.get(normalizedRoomId).get(socket.id);
    if (participant) {
      participant.isVideoOff = isVideoOff;
      socket.to(normalizedRoomId).emit("user-toggle-video", {
        socketId: socket.id,
        userId: participant.userId,
        isVideoOff,
      });
    }
  });

  socket.on("screen-share", ({ roomId, isScreenSharing }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !rooms.has(normalizedRoomId)) return;

    const participant = rooms.get(normalizedRoomId).get(socket.id);
    if (participant) {
      participant.isScreenSharing = isScreenSharing;
      socket.to(normalizedRoomId).emit("user-screen-share", {
        socketId: socket.id,
        userId: participant.userId,
        isScreenSharing,
      });
    }
  });

  socket.on("raise-hand", ({ roomId, isHandRaised }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !rooms.has(normalizedRoomId)) return;

    const participant = rooms.get(normalizedRoomId).get(socket.id);
    if (participant) {
      participant.isHandRaised = isHandRaised;
      socket.to(normalizedRoomId).emit("user-raise-hand", {
        socketId: socket.id,
        userId: participant.userId,
        userName: participant.userName,
        isHandRaised,
      });
    }
  });

  socket.on("send-reaction", ({ roomId, emoji }) => {
    const normalizedRoomId = roomId ? roomId.toLowerCase().trim() : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !rooms.has(normalizedRoomId)) return;

    const participant = rooms.get(normalizedRoomId).get(socket.id);
    io.to(normalizedRoomId).emit("user-reaction", {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      socketId: socket.id,
      userId: participant?.userId || socket.id,
      userName: participant?.userName || "Participant",
      emoji,
      timestamp: Date.now(),
    });
  });

  socket.on("leave-room", async ({ roomId }) => {
    await handleUserLeave(io, socket, roomId);
  });

  socket.on("disconnecting", async () => {
    await handleUserLeave(io, socket);
  });
};

const handleUserLeave = async (io, socket, specifiedRoomId) => {
  const lookup = socketLookup.get(socket.id);
  const roomId = specifiedRoomId ? specifiedRoomId.toLowerCase().trim() : lookup?.roomId;

  if (roomId) {
    if (pendingKnocks.has(roomId)) {
      pendingKnocks.get(roomId).delete(socket.id);
    }

    if (rooms.has(roomId)) {
      const roomParticipants = rooms.get(roomId);
      const participant = roomParticipants.get(socket.id);

      if (participant) {
        roomParticipants.delete(socket.id);
        socket.leave(roomId);

        if (participant.isHost || roomHosts.get(roomId) === socket.id) {
          roomHosts.delete(roomId);
        }

        console.log(
          `🚪 [Socket] User "${participant.userName}" (${socket.id}) left room: ${roomId}. Remaining: ${roomParticipants.size}`
        );

        socket.to(roomId).emit("user-left", {
          socketId: socket.id,
          userId: participant.userId,
          userName: participant.userName,
        });

        io.to(roomId).emit("room-participants-update", {
          participants: Array.from(roomParticipants.values()),
        });

        if (roomParticipants.size === 0) {
          rooms.delete(roomId);
          try {
            await Session.findOneAndUpdate(
              { roomId: new RegExp(`^${roomId}$`, "i") },
              { status: "ended", endedAt: new Date() }
            );
            console.log(`🏁 [Session] Room ${roomId} has 0 participants. Automatically marked session as ended.`);
          } catch (dbErr) {
            console.warn("Auto-end session error:", dbErr.message);
          }
        }
      }
    }
  }

  socketLookup.delete(socket.id);
};
