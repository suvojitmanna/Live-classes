import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ["video", "voice"],
      required: true,
      default: "video",
    },
    status: {
      type: String,
      enum: ["completed", "missed", "declined", "cancelled", "failed"],
      default: "missed",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    // Separate call history deletion for both users
    deletedByCaller: {
      type: Boolean,
      default: false,
    },
    deletedByReceiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query index for fetching user call logs quickly
callSchema.index({ caller: 1, deletedByCaller: 1, createdAt: -1 });
callSchema.index({ receiver: 1, deletedByReceiver: 1, createdAt: -1 });

const Call = mongoose.model("Call", callSchema);

export default Call;
