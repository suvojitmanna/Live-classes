import nodemailer from "nodemailer";

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
};

export const sendVerificationEmail = async (email, name, otp) => {
  const mailTransporter = getTransporter();
  const from = process.env.EMAIL_FROM || '"Live Classes" <noreply@liveclasses.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
          .body { padding: 32px 24px; text-align: center; }
          .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
          .text { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
          .otp-box { display: inline-block; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px 32px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1a73e8; margin-bottom: 24px; font-family: monospace; }
          .warning { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Live Classes</h1>
            <p>Video Conferencing & Collaboration</p>
          </div>
          <div class="body">
            <div class="greeting">Verify your email address</div>
            <p class="text">Hi <strong>${name}</strong>,<br/>Thank you for registering. Please use the following 6-digit verification code to complete your signup. This code is valid for 10 minutes.</p>
            <div class="otp-box">${otp}</div>
            <p class="text">If you did not request this verification, you can safely ignore this email.</p>
            <div class="warning">
              Security Notice: Never share this OTP with anyone. Our team will never ask for your verification code.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Live Classes. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from,
        to: email,
        subject: `${otp} is your Live Classes verification code`,
        text: `Your Live Classes verification code is: ${otp}. It will expire in 10 minutes.`,
        html: htmlContent,
      });
      console.log(`📧 Verification email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending verification email via SMTP:", error.message);
    }
  }

  // Development Fallback logger
  console.log(`🔑 [DEV EMAIL SERVICE] OTP for ${email}:`);
  console.log(`👉 VERIFICATION CODE: [ ${otp} ]`);
  console.log(`⏳ Expires in 10 minutes`);
  return true;
};


//Send Password Reset OTP email
export const sendPasswordResetEmail = async (email, name, otp) => {
  const mailTransporter = getTransporter();
  const from = process.env.EMAIL_FROM || '"Live Classes" <noreply@liveclasses.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #ea4335 0%, #c5221f 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
          .body { padding: 32px 24px; text-align: center; }
          .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
          .text { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
          .otp-box { display: inline-block; background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px; padding: 16px 32px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ea4335; margin-bottom: 24px; font-family: monospace; }
          .warning { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Live Classes</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="body">
            <div class="greeting">Reset your password</div>
            <p class="text">Hi <strong>${name || "User"}</strong>,<br/>We received a request to reset your password. Use the 6-digit OTP code below to proceed. This code expires in 10 minutes.</p>
            <div class="otp-box">${otp}</div>
            <p class="text">If you did not request a password reset, please ignore this message or contact support immediately.</p>
            <div class="warning">
              Security Notice: Do not share this code with anyone.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Live Classes. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from,
        to: email,
        subject: `${otp} is your password reset code`,
        text: `Your Live Classes password reset code is: ${otp}. It will expire in 10 minutes.`,
        html: htmlContent,
      });
      console.log(`📧 Password reset email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending password reset email via SMTP:", error.message);
    }
  }

  console.log(`🔑 [DEV EMAIL SERVICE] Password Reset OTP for ${email}:`);
  console.log(`👉 RESET CODE: [ ${otp} ]`);
  console.log(`⏳ Expires in 10 minutes`);
  return true;
};
