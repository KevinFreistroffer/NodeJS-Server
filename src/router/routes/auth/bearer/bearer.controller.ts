import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { verify } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { findOneById } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { IUserDoc } from "@/defs/interfaces";

export class BearerController {
  static async verify(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(statusCodes.invalid_request)
        .json(genericResponses.invalid_request("Invalid authorization header"));
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify the token
      const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string };

      // Find the user
      const user = await findOneById(new ObjectId(decoded.userId)) as IUserDoc;
      if (!user) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found("User not found"));
      }

      // Return user information
      const { password, usernameNormalized, emailNormalized, ...sanitizedUser } = user;
      return res.status(statusCodes.success).json(genericResponses.success(sanitizedUser));
    } catch (error) {
      return res
        .status(statusCodes.invalid_request)
        .json(genericResponses.invalid_request("Invalid or expired token"));
    }
  }
} 