import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp.toString().trim())
    .digest("hex");
};

export const createOtpRecord = () => {
  const plainOtp = generateOTP();
  const hash = hashOTP(plainOtp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const lastSentAt = new Date();

  return {
    plainOtp,
    otpRecord: {
      hash,
      expiresAt,
      attempts: 0,
      lastSentAt,
    },
  };
};

//Check if resend cooldown is active
export const isResendCooldownActive = (lastSentAt) => {
  if (!lastSentAt) return false;
  const elapsedSeconds = (Date.now() - new Date(lastSentAt).getTime()) / 1000;
  return elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS;
};

export const getRemainingCooldown = (lastSentAt) => {
  if (!lastSentAt) return 0;
  const elapsedSeconds = (Date.now() - new Date(lastSentAt).getTime()) / 1000;
  const remaining = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds);
  return remaining > 0 ? remaining : 0;
};

export const verifyOtpRecord = (otpRecord, enteredOtp) => {
  if (!otpRecord || !otpRecord.hash) {
    return {
      valid: false,
      error: "No verification code requested or already verified",
    };
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    return {
      valid: false,
      error:
        "Too many failed attempts. Please request a new verification code.",
    };
  }

  if (new Date() > new Date(otpRecord.expiresAt)) {
    return {
      valid: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  const enteredHash = hashOTP(enteredOtp);
  if (enteredHash !== otpRecord.hash) {
    return {
      valid: false,
      error: "Invalid verification code. Please try again.",
      incrementAttempt: true,
    };
  }

  return { valid: true };
};
