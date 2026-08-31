import React, { useState } from "react";
import { FaPhoneAlt, FaVideo, FaEnvelope, FaSpinner, FaUserCheck, FaExclamationCircle } from "react-icons/fa";
import { useDirectCall } from "../../context/DirectCallContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const DirectCallPanel = () => {
  const { user } = useAuth();
  const { startDirectCall, checkUser, callState } = useDirectCall();

  const [targetEmail, setTargetEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [userStatus, setUserStatus] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setTargetEmail(val);
    setValidationError("");
    setUserStatus(null);
  };

  const handleInitiateCall = async (callType) => {
    const cleanEmail = targetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setValidationError("Please enter an email address.");
      toast.error("Please enter an email address");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setValidationError("Please enter a valid email format (e.g. name@example.com).");
      toast.error("Invalid email format");
      return;
    }

    if (user?.email && user.email.toLowerCase() === cleanEmail) {
      setValidationError("You cannot call yourself.");
      toast.error("You cannot call yourself");
      return;
    }

    setChecking(true);
    setValidationError("");

    try {
      const res = await checkUser(cleanEmail);

      if (!res.success) {
        setValidationError(res.error || "User not found.");
        toast.error(res.error || "User not found");
        setChecking(false);
        return;
      }

      const { isOnline, isBusy, isSelf, user: targetUser } = res.data;

      if (isSelf) {
        setValidationError("You cannot call yourself.");
        toast.error("You cannot call yourself");
        setChecking(false);
        return;
      }

      if (!isOnline) {
        setValidationError(`${targetUser.name || "User"} is currently offline.`);
        toast.error(`${targetUser.name || "User"} is offline`, { icon: "📴" });
        setChecking(false);
        return;
      }

      if (isBusy) {
        setValidationError(`${targetUser.name || "User"} is busy on another call.`);
        toast.error(`${targetUser.name || "User"} is on another call`, { icon: "⏳" });
        setChecking(false);
        return;
      }

      // User is available! Start call
      setUserStatus({ online: true, busy: false, name: targetUser.name });
      setChecking(false);

      await startDirectCall(cleanEmail, callType);
    } catch (err) {
      setChecking(false);
      toast.error("Failed to verify user availability");
    }
  };

  return (
    <div className="bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/80 rounded-3xl p-6 shadow-md transition-all space-y-5">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Direct Calls</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Call registered users directly by their email address
          </p>
        </div>
      </div>

      {/* Email Input Field */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          Search by email
        </label>
        <div className="relative">
          <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            value={targetEmail}
            onChange={handleEmailChange}
            placeholder="user@example.com"
            className={`w-full bg-gray-50 dark:bg-[#202124] border ${
              validationError
                ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                : "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
            } rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all shadow-inner`}
          />
        </div>

        {/* Live Validation Alert */}
        {validationError && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium pt-1">
            <FaExclamationCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Video Call & Voice Call */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => handleInitiateCall("video")}
          disabled={checking || callState !== "idle"}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
        >
          {checking ? (
            <FaSpinner className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FaVideo className="w-3.5 h-3.5" />
          )}
          <span>Video Call</span>
        </button>

        <button
          onClick={() => handleInitiateCall("voice")}
          disabled={checking || callState !== "idle"}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
        >
          {checking ? (
            <FaSpinner className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FaPhoneAlt className="w-3.5 h-3.5" />
          )}
          <span>Voice Call</span>
        </button>
      </div>
    </div>
  );
};

export default DirectCallPanel;
