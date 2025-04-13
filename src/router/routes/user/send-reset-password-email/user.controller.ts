import { Request, Response } from "express";
import { validationResult } from "express-validator";
import crypto from "crypto";
import { findOneByEmail, updateOne } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { sendResetPasswordEmail } from "@/utils";

export class UserController {
  static async sendResetPasswordEmail(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { email } = req.body;

    const user = await findOneByEmail(email);
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    const doc = await updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
        },
      }
    );

    if (!doc.matchedCount || doc.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("Could not update user with reset token."));
    }

    try {
      await sendResetPasswordEmail(user.email, resetToken);
      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      return res
        .status(statusCodes.could_not_send_email)
        .json(userResponses.could_not_send_email("Could not send reset password email."));
    }
  }
} 