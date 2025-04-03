import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { findOneByEmail } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { IUserDoc } from "@/defs/interfaces";
import { sign } from "jsonwebtoken";
import nodemailer from "nodemailer";

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

// Function to send email
const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  return transporter.sendMail(mailOptions);
};

export class EmailController {
  static async sendVerification(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { email } = req.body;

    try {
      // Find user by email
      const user = await findOneByEmail(email) as IUserDoc;
      if (!user) {
        // Return success even if user doesn't exist to prevent email enumeration
        return res.status(statusCodes.success).json(genericResponses.success());
      }

      // Check if user is already verified
      if (user.isVerified) {
        return res
          .status(statusCodes.invalid_request)
          .json(genericResponses.invalid_request("Email is already verified"));
      }

      // Generate verification token
      const verificationToken = sign(
        { userId: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Create verification URL
      const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

      // Send verification email
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `
          <h1>Email Verification</h1>
          <p>Hello ${user.username},</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not request this verification, please ignore this email.</p>
        `,
      });

      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      console.error("Error sending verification email:", error);
      return res
        .status(statusCodes.caught_error)
        .json(genericResponses.caught_error(error));
    }
  }
} 