import express from "express";
import { body, validationResult } from "express-validator";
import { getMe, login, register } from "../controllers/authcontroller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ✅ Validation handler middleware
const handleValidationError = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(), // ✅ helpful for debugging
    });
  }

  next();
};


// ================= REGISTER =================
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("email")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  handleValidationError,
  register
);


// ================= LOGIN =================
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  handleValidationError,
  login
);


// ================= GET USER =================
router.get("/me", protect, getMe);

export default router;