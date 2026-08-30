import express from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  getMe,
  login,
  register,
  verifyEmail,
  resendOtp,
  googleAuth,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authcontroller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP attempts, please try again in a few minutes.",
  },
});

const handleValidationError = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

router.post("/register", authLimiter, [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Valid email address is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
],
  handleValidationError,
  register
);

router.post("/verify-email", otpLimiter, [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("otp")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits"),
],
  handleValidationError,
  verifyEmail
);

router.post("/resend-otp", otpLimiter, [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail()],
  handleValidationError,
  resendOtp
);

router.post("/login", authLimiter, [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
],
  handleValidationError,
  login
);

router.post("/google", authLimiter, googleAuth);

router.post("/forgot-password", otpLimiter, [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail()],
  handleValidationError,
  forgotPassword
);

router.post("/verify-reset-otp", otpLimiter, [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("Reset code must be 6 digits"),
],
  handleValidationError,
  verifyResetOtp
);

router.post("/reset-password", authLimiter, [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("Reset code must be 6 digits"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
],
  handleValidationError,
  resetPassword
);

router.get("/me", protect, getMe);

export default router;
