import Session from "../models/Session.js";
import { getIO } from "./index.js";

const rooms = new Map();
const socketLookup = new Map();
const roomHosts = new Map();
const pendingKnocks = new Map();
const roomPermissions = new Map();
const roomPolls = new Map();

const normalizeRoomId = (raw) => {
  if (!raw) return "";
  try {
    let str = decodeURIComponent(raw).toLowerCase().trim();
    return str.replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  } catch (e) {
    return raw.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  }
};

export const isRoomActive = (roomId) => {
  if (!roomId) return false;
  const normalized = normalizeRoomId(roomId);
  return rooms.has(normalized) && rooms.get(normalized).size > 0;
};

export const getRoomParticipantCount = (roomId) => {
  if (!roomId) return 0;
  const normalized = normalizeRoomId(roomId);
  return rooms.has(normalized) ? rooms.get(normalized).size : 0;
};

export const notifyMeetingDeleted = (roomId) => {
  if (!roomId) return;
  const normalized = normalizeRoomId(roomId);
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
  roomPermissions.delete(normalized);
  roomPolls.delete(normalized);
};

export const registerMeetingSocket = (io, socket) => {
  socket.on(
    "join-room",
    async ({
      roomId,
      userId,
      userName,
      avatar,
      isMuted,
      isVideoOff,
      isHost,
    }) => {
      if (!roomId) return;

      const normalizedRoomId = normalizeRoomId(roomId);
      let actualIsHost = false;

      try {
        const session = await Session.findOne({
          roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
        });

        if (session) {
          if (session.isExpired && session.isExpired()) {
            socket.emit("link-expired-error", {
              message:
                "This meeting link has expired and is disabled by the host.",
            });
            return;
          }

          if (
            session.host &&
            userId &&
            session.host.toString() === userId.toString()
          ) {
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
        userId: (userId || socket.id).toString(),
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
        userId: (userId || socket.id).toString(),
        isHost: actualIsHost,
      });

      try {
        const sessionDoc = await Session.findOne({
          roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
        });

        if (sessionDoc) {
          sessionDoc.status = "active";
          const pIdx = sessionDoc.participants.findIndex(
            (p) =>
              p.userId &&
              p.userId.toString() === (userId || socket.id).toString(),
          );

          if (pIdx >= 0) {
            sessionDoc.participants[pIdx].leftAt = null;
            sessionDoc.participants[pIdx].joinedAt = new Date();
            sessionDoc.participants[pIdx].isHost = actualIsHost;
            sessionDoc.participants[pIdx].userName =
              userName || sessionDoc.participants[pIdx].userName;
            sessionDoc.participants[pIdx].avatar =
              avatar || sessionDoc.participants[pIdx].avatar;
          } else {
            sessionDoc.participants.push({
              userId: (userId || socket.id).toString(),
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

      const currentPerms = roomPermissions.get(normalizedRoomId) || {
        allowMic: true,
        allowCamera: true,
        allowScreenShare: true,
        allowChat: true,
      };
      socket.emit("room-permissions-updated", currentPerms);

      const currentPolls = roomPolls.get(normalizedRoomId) || [];
      socket.emit("polls-sync", { polls: currentPolls });

      if (actualIsHost && pendingKnocks.has(normalizedRoomId)) {
        const knocks = Array.from(pendingKnocks.get(normalizedRoomId).values());
        if (knocks.length > 0) {
          socket.emit("pending-knocks-sync", { knocks });
        }
      }

      socket.to(normalizedRoomId).emit("user-joined", {
        socketId: socket.id,
        userId: participantData.userId,
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
    },
  );

  socket.on("knock-to-join", async ({ roomId, user }) => {
    if (!roomId || !user) return;

    const normalizedRoomId = normalizeRoomId(roomId);

    try {
      const session = await Session.findOne({
        roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
      });

      if (session) {
        if (session.isExpired && session.isExpired()) {
          socket.emit("knock-response", {
            status: "expired",
            message:
              "This meeting link has expired and is disabled by the host.",
          });
          return;
        }

        const isUserHost = !!(
          session.host &&
          (user.id || user._id) &&
          session.host.toString() === (user.id || user._id).toString()
        );
        if (isUserHost) {
          socket.emit("knock-response", {
            status: "admitted",
            roomId: normalizedRoomId,
            isHost: true,
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Knock DB lookup notice:", e.message);
    }

    if (!pendingKnocks.has(normalizedRoomId)) {
      pendingKnocks.set(normalizedRoomId, new Map());
    }

    const knockData = {
      socketId: socket.id,
      userId: user.id || user._id || socket.id,
      userName: user.name || "Guest Participant",
      avatar: user.avatar || "",
      requestedAt: new Date().toISOString(),
    };

    pendingKnocks.get(normalizedRoomId).set(socket.id, knockData);
    socketLookup.set(socket.id, {
      roomId: normalizedRoomId,
      userId: user.id || socket.id,
    });

    io.to(normalizedRoomId).emit("user-knocking", knockData);

    const knocks = Array.from(pendingKnocks.get(normalizedRoomId).values());
    io.to(normalizedRoomId).emit("pending-knocks-sync", { knocks });
  });

  socket.on("host-decision", ({ roomId, targetSocketId, decision }) => {
    const normalizedRoomId = roomId
      ? normalizeRoomId(roomId)
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !targetSocketId) return;

    if (pendingKnocks.has(normalizedRoomId)) {
      pendingKnocks.get(normalizedRoomId).delete(targetSocketId);
    }

    if (decision === "admit") {
      io.to(targetSocketId).emit("knock-response", {
        status: "admitted",
        roomId: normalizedRoomId,
      });
    } else {
      io.to(targetSocketId).emit("knock-response", {
        status: "denied",
        message: "The host denied your request to join this meeting.",
      });
    }

    const knocks = pendingKnocks.has(normalizedRoomId)
      ? Array.from(pendingKnocks.get(normalizedRoomId).values())
      : [];
    io.to(normalizedRoomId).emit("pending-knocks-sync", { knocks });
  });

  socket.on("cancel-knock", ({ roomId }) => {
    const normalizedRoomId = roomId
      ? normalizeRoomId(roomId)
      : socketLookup.get(socket.id)?.roomId;
    if (normalizedRoomId && pendingKnocks.has(normalizedRoomId)) {
      pendingKnocks.get(normalizedRoomId).delete(socket.id);
      const knocks = Array.from(pendingKnocks.get(normalizedRoomId).values());
      io.to(normalizedRoomId).emit("pending-knocks-sync", { knocks });
    }
  });

  socket.on("toggle-admission", async ({ roomId, requireAdmission }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId) return;

    try {
      await Session.findOneAndUpdate(
        { roomId: new RegExp(`^${normalizedRoomId}$`, "i") },
        { requireAdmission: !!requireAdmission },
      );
      io.to(normalizedRoomId).emit("admission-toggled", {
        requireAdmission: !!requireAdmission,
      });
    } catch (e) {}
  });

  socket.on("set-link-expiration", async ({ roomId, minutes }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
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
        },
      );

      console.log(
        `⏱️ [Link Expiration] Room ${normalizedRoomId} expiration set: ${
          isLinkDisabled ? "Disabled immediately" : `${minutes} minutes`
        }`,
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
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId) return;

    try {
      const session = await Session.findOne({
        roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
      });

      const lookup = socketLookup.get(socket.id);
      if (
        session &&
        (!lookup?.userId ||
          session.host.toString() === lookup.userId.toString())
      ) {
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
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
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
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
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
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
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
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
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
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
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

  socket.on("send-chat-message", ({ roomId, text, sender }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !text || !text.trim()) return;

    const participant = rooms.has(normalizedRoomId)
      ? rooms.get(normalizedRoomId).get(socket.id)
      : null;

    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      text: text.trim(),
      sender: {
        id: sender?.id || participant?.userId || socket.id,
        name: sender?.name || participant?.userName || "Participant",
        avatar: sender?.avatar || participant?.avatar || "",
      },
      timestamp: Date.now(),
    };

    io.to(normalizedRoomId).emit("chat-message", messageData);
  });

  socket.on("send-caption", ({ roomId, text, userName }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !text) return;

    io.to(normalizedRoomId).emit("caption-update", {
      text,
      userName: userName || "Participant",
      socketId: socket.id,
      timestamp: Date.now(),
    });
  });

  socket.on("host-update-permissions", ({ roomId, permissions }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !permissions) return;

    const isHost = socketLookup.get(socket.id)?.isHost;
    if (!isHost) return;

    const prev = roomPermissions.get(normalizedRoomId) || {
      allowMic: true,
      allowCamera: true,
      allowScreenShare: true,
      allowChat: true,
    };

    const updated = { ...prev, ...permissions };
    roomPermissions.set(normalizedRoomId, updated);

    io.to(normalizedRoomId).emit("room-permissions-updated", updated);

    if (permissions.allowMic === false) {
      socket.to(normalizedRoomId).emit("force-mute");
    }
    if (permissions.allowCamera === false) {
      socket.to(normalizedRoomId).emit("force-stop-video");
    }
    if (permissions.allowScreenShare === false) {
      socket.to(normalizedRoomId).emit("force-stop-screen");
    }
  });

  socket.on("host-mute-all", ({ roomId }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId) return;

    const isHost = socketLookup.get(socket.id)?.isHost;
    if (!isHost) return;

    socket.to(normalizedRoomId).emit("force-mute");
  });

  socket.on("host-stop-all-video", ({ roomId }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId) return;

    const isHost = socketLookup.get(socket.id)?.isHost;
    if (!isHost) return;

    socket.to(normalizedRoomId).emit("force-stop-video");
  });

  socket.on("host-control-user", async ({ roomId, targetSocketId, action }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !targetSocketId || !action) return;

    const isHost = socketLookup.get(socket.id)?.isHost;
    if (!isHost) return;

    if (action === "mute") {
      io.to(targetSocketId).emit("force-mute");
    } else if (action === "stop-video") {
      io.to(targetSocketId).emit("force-stop-video");
    } else if (action === "stop-screen") {
      io.to(targetSocketId).emit("force-stop-screen");
    } else if (action === "kick") {
      io.to(targetSocketId).emit("force-kick", {
        message: "You were removed from the meeting by the host.",
      });
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        await handleUserLeave(io, targetSocket, normalizedRoomId);
        targetSocket.leave(normalizedRoomId);
      }
    }
  });

  socket.on("create-poll", ({ roomId, question, options }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (
      !normalizedRoomId ||
      !question ||
      !Array.isArray(options) ||
      options.length < 2
    )
      return;

    if (!roomPolls.has(normalizedRoomId)) {
      roomPolls.set(normalizedRoomId, []);
    }

    const participant = rooms.has(normalizedRoomId)
      ? rooms.get(normalizedRoomId).get(socket.id)
      : null;
    const pollId = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newPoll = {
      id: pollId,
      question: question.trim(),
      options: options.map((opt, idx) => ({
        id: `opt_${idx}`,
        text:
          typeof opt === "string"
            ? opt.trim()
            : opt.text?.trim() || `Option ${idx + 1}`,
        votes: 0,
        voters: [],
      })),
      createdBy: {
        id: participant?.userId || socket.id,
        name: participant?.userName || "Host",
      },
      createdAt: Date.now(),
      isActive: true,
    };

    roomPolls.get(normalizedRoomId).unshift(newPoll);

    io.to(normalizedRoomId).emit("new-poll-created", newPoll);
    io.to(normalizedRoomId).emit("polls-sync", {
      polls: roomPolls.get(normalizedRoomId),
    });
  });

  socket.on(
    "vote-poll",
    ({ roomId, pollId, optionIndex, voterId, voterName }) => {
      const normalizedRoomId = roomId
        ? roomId.toLowerCase().trim()
        : socketLookup.get(socket.id)?.roomId;
      if (!normalizedRoomId || !pollId || optionIndex === undefined) return;

      const polls = roomPolls.get(normalizedRoomId);
      if (!polls) return;

      const poll = polls.find((p) => p.id === pollId);
      if (!poll || !poll.isActive) return;

      const uid = (
        voterId ||
        socketLookup.get(socket.id)?.userId ||
        socket.id
      ).toString();

      const alreadyVoted = poll.options.some((opt) => opt.voters.includes(uid));
      if (alreadyVoted) return;

      if (poll.options[optionIndex]) {
        poll.options[optionIndex].votes += 1;
        poll.options[optionIndex].voters.push(uid);

        io.to(normalizedRoomId).emit("polls-sync", { polls });
      }
    },
  );

  socket.on("close-poll", ({ roomId, pollId }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !pollId) return;

    const isHost = socketLookup.get(socket.id)?.isHost;
    if (!isHost) return;

    const polls = roomPolls.get(normalizedRoomId);
    if (!polls) return;

    const poll = polls.find((p) => p.id === pollId);
    if (poll) {
      poll.isActive = false;
      io.to(normalizedRoomId).emit("polls-sync", { polls });
    }
  });

  socket.on("delete-poll", ({ roomId, pollId }) => {
    const normalizedRoomId = roomId
      ? roomId.toLowerCase().trim()
      : socketLookup.get(socket.id)?.roomId;
    if (!normalizedRoomId || !pollId) return;

    const isHost = socketLookup.get(socket.id)?.isHost;
    if (!isHost) return;

    if (roomPolls.has(normalizedRoomId)) {
      const filtered = roomPolls
        .get(normalizedRoomId)
        .filter((p) => p.id !== pollId);
      roomPolls.set(normalizedRoomId, filtered);
      console.log(
        `🗑️ [Poll Deleted] Poll ${pollId} deleted from room: ${normalizedRoomId}`,
      );
      io.to(normalizedRoomId).emit("polls-sync", { polls: filtered });
    }
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
  const roomId = specifiedRoomId
    ? specifiedRoomId.toLowerCase().trim()
    : lookup?.roomId;

  if (roomId) {
    if (pendingKnocks.has(roomId)) {
      pendingKnocks.get(roomId).delete(socket.id);
      const knocks = Array.from(pendingKnocks.get(roomId).values());
      io.to(roomId).emit("pending-knocks-sync", { knocks });
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
              { status: "ended", endedAt: new Date() },
            );
            console.log(
              `🏁 [Session] Room ${roomId} has 0 participants. Automatically marked session as ended.`,
            );
          } catch (dbErr) {
            console.warn("Auto-end session error:", dbErr.message);
          }
        }
      }
    }
  }

  socketLookup.delete(socket.id);
};
