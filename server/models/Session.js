import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: "Live Class Meeting",
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "ended", "expired"],
      default: "active",
    },
    requireAdmission: {
      type: Boolean,
      default: true,
    },
    isLinkDisabled: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
          default: "",
        },
        isHost: {
          type: Boolean,
          default: false,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: {
          type: Date,
          default: null,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.methods.isExpired = function () {
  if (this.isLinkDisabled || this.status === "expired") return true;
  if (this.expiresAt && new Date(this.expiresAt) <= new Date()) return true;
  return false;
};

sessionSchema.statics.generateRoomId = function () {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const genPart = (length) => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return `${genPart(3)}-${genPart(4)}-${genPart(3)}`;
};

sessionSchema.statics.roomIdExists = async function (roomId) {
  const session = await this.findOne({ roomId: roomId.toLowerCase().trim() });
  return !!session;
};

export default mongoose.model("Session", sessionSchema);
