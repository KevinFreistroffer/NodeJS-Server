import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { findOne, updateOne } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { generateResetPasswordToken } from "@/utils";
import passwordHash from "password-hash";

export class PasswordController {
  static async reset(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    if (
      !process.env.EMAIL_FROM ||
      !process.env.EMAIL_APP_PASSWORD ||
      !process.env.NODE_ENV
    ) {
      throw new Error("Email credentials or node environment are not set.");
    }

    const { email, token, password } = req.body;

    const userDoc = await findOne({
      query: {
        email: email,
        resetPasswordToken: token,
      },
      sanitize: true,
    });

    if (!userDoc) {
      return res
        .status(statusCodes.access_denied)
        .json(genericResponses.access_denied());
    }

    // Verify that the provided token matches the stored token
    if (userDoc.resetPasswordToken !== token) {
      return res
        .status(statusCodes.invalid_request)
        .json(genericResponses.invalid_request("Invalid reset password token"));
    }

    const hashedPassword = passwordHash.generate(password);
    const {
      token: resetPasswordToken,
      expirationDate: resetPasswordTokenExpires,
    } = generateResetPasswordToken(3);

    const doc = await updateOne(
      { _id: userDoc._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken,
          resetPasswordTokenExpires,
        },
      }
    );

    if (!doc.matchedCount) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    if (doc.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("User not updated."));
    }

    return res.status(statusCodes.success).json(genericResponses.success());
  }
} 