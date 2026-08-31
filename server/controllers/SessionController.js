import Session from "../models/Session.js";
import User from "../models/user.js";
import {
  isRoomActive,
  getRoomParticipantCount,
  notifyMeetingDeleted,
} from "../socket/meetingSocket.js";

export const listSession = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const sessions = await Session.find({
      $or: [{ host: userId }, { "participants.userId": userId }],
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      sessions.map(async (s) => {
        const liveInSocket = isRoomActive(s.roomId);
        let actualStatus = s.status;

        if (s.isExpired && s.isExpired()) {
          actualStatus = "expired";
        } else if (s.status === "active" && !liveInSocket) {
          actualStatus = "ended";
          await Session.findByIdAndUpdate(s._id, {
            status: "ended",
            endedAt: s.endedAt || new Date(),
          });
        }

        const liveCount = liveInSocket
          ? getRoomParticipantCount(s.roomId)
          : s.participants.filter((p) => !p.leftAt).length;

        return {
          id: s._id,
          roomId: s.roomId,
          title: s.title,
          hostName: s.hostName,
          status: actualStatus,
          isLinkDisabled: s.isLinkDisabled,
          expiresAt: s.expiresAt,
          participantCount: liveCount,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
          isHost: s.host.toString() === userId.toString(),
        };
      }),
    );

    const filteredResult =
      status && status !== "all"
        ? result.filter((s) => s.status === status)
        : result;

    res.json({
      success: true,
      data: {
        session: filteredResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    let roomId;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      roomId = Session.generateRoomId();
      const exists = await Session.roomIdExists(roomId);
      if (!exists) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate unique room ID. Please try again.",
      });
    }

    const session = await Session.create({
      roomId,
      title: title || "Live Class Meeting",
      host: userId,
      hostName: user.name,
      status: "active",
      requireAdmission: true,
      isLinkDisabled: false,
      participants: [
        {
          userId: userId,
          userName: user.name,
          avatar: user.avatar || "",
          isHost: true,
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: {
        session: {
          id: session._id,
          roomId: session.roomId,
          title: session.title,
          host: session.host.toString(),
          hostName: session.hostName,
          status: session.status,
          participantCount: 1,
          startedAt: session.startedAt,
          isHost: true,
          participants: session.participants,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const JoinSession = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const userId = req.user.userId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required",
      });
    }

    const normalizedRoomId = roomId.toLowerCase().trim();
    const session = await Session.findOne({
      roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Meeting room not found. Please verify the room ID.",
      });
    }

    if (session.isExpired && session.isExpired()) {
      return res.status(403).json({
        success: false,
        error: "This meeting link has expired and is disabled by the host.",
        isExpired: true,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isHost = session.host.toString() === userId.toString();
    session.status = "active";

    const participantIndex = session.participants.findIndex(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (participantIndex >= 0) {
      session.participants[participantIndex].leftAt = null;
      session.participants[participantIndex].joinedAt = new Date();
      session.participants[participantIndex].isHost = isHost;
    } else {
      session.participants.push({
        userId: userId,
        userName: user.name,
        avatar: user.avatar || "",
        isHost,
        joinedAt: new Date(),
      });
    }

    await session.save();

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          roomId: session.roomId,
          title: session.title,
          host: session.host.toString(),
          hostName: session.hostName,
          status: session.status,
          participantCount: session.participants.filter((p) => !p.leftAt)
            .length,
          isHost,
          requireAdmission: session.requireAdmission,
          participants: session.participants,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required",
      });
    }

    const normalizedRoomId = roomId.toLowerCase().trim();
    const session = await Session.findOne({
      roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Meeting room not found. Please verify the room ID.",
      });
    }

    // Check expiration
    if (session.isExpired && session.isExpired()) {
      return res.status(403).json({
        success: false,
        error: "This meeting link has expired and is disabled by the host.",
        isExpired: true,
      });
    }

    const isHost = userId
      ? session.host.toString() === userId.toString()
      : false;
    const isParticipant = userId
      ? session.participants.some(
          (p) => p.userId.toString() === userId.toString(),
        )
      : false;

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          roomId: session.roomId,
          title: session.title,
          host: session.host.toString(),
          hostName: session.hostName,
          status: session.status,
          isLinkDisabled: session.isLinkDisabled,
          expiresAt: session.expiresAt,
          requireAdmission: session.requireAdmission,
          participantCount: session.participants.filter((p) => !p.leftAt)
            .length,
          isHost,
          isParticipant,
          participants: session.participants,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const expireSession = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { minutes } = req.body;
    const userId = req.user.userId;
    const normalizedRoomId = roomId.toLowerCase().trim();
    const session = await Session.findOne({
      roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found.",
      });
    }

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Only the host can configure link expiration.",
      });
    }

    let expiresAt = null;
    let isLinkDisabled = false;

    if (minutes === 0) {
      isLinkDisabled = true;
      expiresAt = new Date();
      session.status = "expired";
    } else if (minutes > 0) {
      expiresAt = new Date(Date.now() + minutes * 60 * 1000);
      session.status = "active";
    } else {
      isLinkDisabled = false;
      expiresAt = null;
    }

    session.isLinkDisabled = isLinkDisabled;
    session.expiresAt = expiresAt;
    await session.save();

    res.json({
      success: true,
      data: {
        roomId: session.roomId,
        isLinkDisabled: session.isLinkDisabled,
        expiresAt: session.expiresAt,
        status: session.status,
      },
      message: isLinkDisabled
        ? "Meeting link disabled immediately."
        : `Meeting link will expire in ${minutes} minutes.`,
    });
  } catch (error) {
    next(error);
  }
};

export const endSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    let session = null;
    if (sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      session = await Session.findById(sessionId);
    }
    if (!session) {
      session = await Session.findOne({
        roomId: new RegExp(`^${sessionId.toLowerCase().trim()}$`, "i"),
      });
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found.",
      });
    }

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Only the host can end the meeting.",
      });
    }

    session.status = "ended";
    session.endedAt = new Date();
    await session.save();

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          roomId: session.roomId,
          status: session.status,
          endedAt: session.endedAt,
        },
      },
      message: "Meeting ended successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const leaveSession = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const userId = req.user.userId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required",
      });
    }

    const normalizedRoomId = roomId.toLowerCase().trim();
    const session = await Session.findOne({
      roomId: new RegExp(`^${normalizedRoomId}$`, "i"),
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found.",
      });
    }

    const participant = session.participants.find(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (participant) {
      participant.leftAt = new Date();
    }
    const activeParticipants = session.participants.filter((p) => !p.leftAt);
    const roomActiveInSocket = isRoomActive(session.roomId);

    if (activeParticipants.length === 0 && !roomActiveInSocket) {
      session.status = "ended";
      session.endedAt = new Date();
    }
    await session.save();

    res.json({
      success: true,
      data: {
        message: "Left meeting room successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required",
      });
    }

    const normalizedRoomId = roomId.toLowerCase().trim();
    const session = await Session.findOne({
      $or: [
        { roomId: new RegExp(`^${normalizedRoomId}$`, "i") },
        ...(roomId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: roomId }] : []),
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Only the host can delete this meeting link.",
      });
    }

    await Session.deleteOne({ _id: session._id });
    notifyMeetingDeleted(session.roomId);

    return res.status(200).json({
      success: true,
      message: "Meeting session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
