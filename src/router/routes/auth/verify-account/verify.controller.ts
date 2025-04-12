import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { verify } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { findOneById, updateOne } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse, statusCodes } from "@/defs/responses/generic";
import { errorCodes } from "@/defs/responses/status_codes";
import { IUserDoc } from "@/defs/interfaces";

export class VerifyController {
  static async verifyAccount(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { token } = req.body;

    try {
      // Verify the token
      const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string };

      // Find the user
      const user = await findOneById(new ObjectId(decoded.userId)) as IUserDoc;
      if (!user) {
        return res
          .status(statusCodes.resource_not_found)
          .json(userResponses.user_not_found("User not found"));
      }

      // Check if user is already verified
      if (user.isVerified) {
        return res
          .status(statusCodes.invalid_request)
          .json(genericResponses.invalid_request("Account is already verified"));
      }

      // Update user to mark as verified
      const doc = await updateOne(
        { _id: user._id },
        { $set: { isVerified: true } }
      );

      if (!doc.matchedCount || doc.modifiedCount === 0) {
        return res
          .status(statusCodes.something_went_wrong)
          .json(userResponses.could_not_update("Could not verify account"));
      }

      // Return success
      return res.status(statusCodes.success).json(genericResponses.success("Account verified successfully"));
    } catch (error) {
      console.error("Error verifying account:", error);
      return res
        .status(statusCodes.invalid_request)
        .json(genericResponses.invalid_request("Invalid or expired verification token"));
    }
  }
} 