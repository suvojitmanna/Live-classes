import User from "../models/user.js";
import { generateToken } from "../utills/jwt.js";
import {
  createOtpRecord,
  isResendCooldownActive,
  getRemainingCooldown,
  verifyOtpRecord,
} from "../services/otpService.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email. Please sign in.",
      });
    }

    const { plainOtp, otpRecord } = createOtpRecord();
    if (user && !user.isEmailVerified) {
      user.name = name.trim();
      user.password = password;
      user.otp = otpRecord;
      user.authProvider = "local";
      await user.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        isEmailVerified: false,
        authProvider: "local",
        otp: otpRecord,
      });
    }

    await sendVerificationEmail(normalizedEmail, user.name, plainOtp);
    res.status(201).json({
      success: true,
      message: "Registration initiated! Please enter the 6-digit verification code sent to your email.",
      data: {
        email: normalizedEmail,
        requiresVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify Email with 6 - Digit OTP
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit verification code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found. Please register first.",
      });
    }

    if (user.isEmailVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: "Email is already verified.",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isEmailVerified: true,
          },
          token,
        },
      });
    }

    const verificationResult = verifyOtpRecord(user.otp, otp);
    if (!verificationResult.valid) {
      if (verificationResult.incrementAttempt) {
        user.otp.attempts = (user.otp.attempts || 0) + 1;
        await user.save();
      }
      return res.status(400).json({
        success: false,
        message: verificationResult.error,
      });
    }

    user.isEmailVerified = true;
    user.otp = {
      hash: null,
      expiresAt: null,
      attempts: 0,
      lastSentAt: null,
    };
    await user.save();
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to Live Classes.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: true,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend Email Verification OTP
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified. Please sign in.",
      });
    }

    if (isResendCooldownActive(user.otp?.lastSentAt)) {
      const remainingSeconds = getRemainingCooldown(user.otp.lastSentAt);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
        remainingSeconds,
      });
    }

    const { plainOtp, otpRecord } = createOtpRecord();
    user.otp = otpRecord;
    await user.save();

    await sendVerificationEmail(normalizedEmail, user.name, plainOtp);

    res.status(200).json({
      success: true,
      message: "A new 6-digit verification code has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

//Standard Email / Password Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      const { plainOtp, otpRecord } = createOtpRecord();
      user.otp = otpRecord;
      await user.save();
      await sendVerificationEmail(normalizedEmail, user.name, plainOtp);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: "Please verify your email address to continue. A verification code has been sent.",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
      message: "Welcome back! Logged in successfully.",
    });
  } catch (error) {
    next(error);
  }
};

//Google Sign In / Sign Up with OAuth Token Verification
export const googleAuth = async (req, res, next) => {
  try {
    const { credential, accessToken, userInfo } = req.body;
    let googleUser = null;

    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        googleUser = {
          googleId: payload.sub,
          email: payload.email.toLowerCase().trim(),
          name: payload.name || payload.email.split("@")[0],
          avatar: payload.picture || "",
        };
      } catch (err) {
        console.warn("verifyIdToken fallback:", err.message);
        const payload = JSON.parse(
          Buffer.from(credential.split(".")[1], "base64").toString("utf-8")
        );
        googleUser = {
          googleId: payload.sub,
          email: payload.email.toLowerCase().trim(),
          name: payload.name || payload.email.split("@")[0],
          avatar: payload.picture || "",
        };
      }
    } else if (userInfo && userInfo.email) {
      googleUser = {
        googleId: userInfo.id || userInfo.sub,
        email: userInfo.email.toLowerCase().trim(),
        name: userInfo.name || userInfo.email.split("@")[0],
        avatar: userInfo.picture || "",
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Google authentication credentials are required",
      });
    }

    let user = await User.findOne({
      $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
    });

    if (user) {
      if (!user.googleId) user.googleId = googleUser.googleId;
      if (!user.isEmailVerified) user.isEmailVerified = true;
      if (!user.avatar && googleUser.avatar) user.avatar = googleUser.avatar;
      await user.save();
    } else {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
        isEmailVerified: true,
        authProvider: "google",
      });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Forgot Password - Send Reset Code
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset code has been sent.",
      });
    }

    if (isResendCooldownActive(user.passwordResetOtp?.lastSentAt)) {
      const remaining = getRemainingCooldown(user.passwordResetOtp.lastSentAt);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remaining} seconds before requesting another reset code.`,
      });
    }

    const { plainOtp, otpRecord } = createOtpRecord();
    user.passwordResetOtp = otpRecord;
    await user.save();

    await sendPasswordResetEmail(normalizedEmail, user.name, plainOtp);

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset code has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

//Verify Password Reset Code
export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and reset code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code.",
      });
    }

    const result = verifyOtpRecord(user.passwordResetOtp, otp);
    if (!result.valid) {
      if (result.incrementAttempt) {
        user.passwordResetOtp.attempts = (user.passwordResetOtp.attempts || 0) + 1;
        await user.save();
      }
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Reset code verified. Please set your new password.",
    });
  } catch (error) {
    next(error);
  }
};

//Reset Password with Verified OTP
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

    const result = verifyOtpRecord(user.passwordResetOtp, otp);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    user.password = newPassword;
    user.authProvider = "local";
    user.passwordResetOtp = {
      hash: null,
      expiresAt: null,
      attempts: 0,
      lastSentAt: null,
    };
    user.isEmailVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Password reset successful! You are now logged in.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: true,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Get Current Authenticated User
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          authProvider: user.authProvider,
        },
      },
      message: "User fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
