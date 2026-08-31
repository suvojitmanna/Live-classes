import Call from "../models/Call.js";
import User from "../models/user.js";
import { isUserOnline, isUserBusy } from "../socket/directCallSocket.js";

export const getCallHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const calls = await Call.find({
      $or: [
        { caller: userId, deletedByCaller: { $ne: true } },
        { receiver: userId, deletedByReceiver: { $ne: true } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("caller", "name email avatar")
      .populate("receiver", "name email avatar");

    const formattedCalls = calls.map((call) => {
      const isIncoming = call.receiver?._id?.toString() === userId.toString();
      const peer = isIncoming ? call.caller : call.receiver;

      return {
        id: call._id,
        callType: call.callType,
        status: call.status,
        direction: isIncoming ? "incoming" : "outgoing",
        startedAt: call.startedAt,
        connectedAt: call.connectedAt,
        endedAt: call.endedAt,
        durationSeconds: call.durationSeconds || 0,
        peer: {
          id: peer?._id || null,
          name: peer?.name || "Unknown User",
          email: peer?.email || "",
          avatar: peer?.avatar || "",
        },
      };
    });

    res.json({
      success: true,
      data: {
        calls: formattedCalls,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const checkUserAvailability = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: "Email address is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const targetUser = await User.findOne({ email: cleanEmail });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: `No registered user found with email "${cleanEmail}".`,
      });
    }

    const isSelf = targetUser._id.toString() === currentUserId.toString();
    const online = isUserOnline(targetUser._id);
    const busy = isUserBusy(targetUser._id);

    res.json({
      success: true,
      data: {
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          avatar: targetUser.avatar,
        },
        isSelf,
        isOnline: online,
        isBusy: busy,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCallHistoryItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { callId } = req.params;

    const call = await Call.findOne({
      _id: callId,
      $or: [{ caller: userId }, { receiver: userId }],
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        error: "Call record not found or unauthorized.",
      });
    }

    const isCaller = call.caller.toString() === userId.toString();
    const isReceiver = call.receiver.toString() === userId.toString();

    if (isCaller) {
      call.deletedByCaller = true;
    }
    if (isReceiver) {
      call.deletedByReceiver = true;
    }

    if (call.deletedByCaller && call.deletedByReceiver) {
      await Call.deleteOne({ _id: callId });
    } else {
      await call.save();
    }

    res.json({
      success: true,
      message: "Call log entry deleted from your history.",
    });
  } catch (err) {
    next(err);
  }
};
