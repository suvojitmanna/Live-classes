import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";
import {
  FaShieldAlt,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const navigate = useNavigate();
  const { verifyEmail, resendOtp, isAuthenticated } = useAuth();
  const [email] = useState(emailParam);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isAuthenticated && !isVerified) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isVerified, navigate]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      setError("");
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const fullOtp =
      typeof codeToVerify === "string" ? codeToVerify : otp.join("");

    if (fullOtp.length !== 6) {
      setError("Please enter all 6 digits of the verification code");
      return;
    }

    if (!email) {
      setError("Email address is missing");
      return;
    }

    setLoading(true);
    setError("");

    const result = await verifyEmail(email, fullOtp);

    if (result.success) {
      setIsVerified(true);
      toast.success("Email verified successfully! 🎉");
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 1000);
    } else {
      setError(result.error || "Invalid or expired verification code");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending || !email) return;

    setResending(true);
    setError("");

    const result = await resendOtp(email);
    setResending(false);

    if (result.success) {
      toast.success("A new verification code has been sent! 📧");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || "Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 flex items-center justify-center p-4 sm:p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-[#282a2d] rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700/80 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl mx-auto mb-6 shadow-lg shadow-blue-500/20">
          {isVerified ? <FaCheckCircle /> : <FaShieldAlt />}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verify your email
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {email || "your email address"}
          </span>
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div
          className="flex justify-center gap-2 sm:gap-3 mb-8"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-[#202124] border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={loading || otp.some((d) => !d)}
          className="w-full py-3.5 px-6 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mb-6"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin w-4 h-4" />
              <span>Verifying Code...</span>
            </>
          ) : (
            "Verify Email"
          )}
        </button>

        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
          <p>
            Didn't receive the code?{" "}
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline transition-colors"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            ) : (
              <span className="text-gray-400 font-mono">
                Resend in {countdown}s
              </span>
            )}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" /> Change email address
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
