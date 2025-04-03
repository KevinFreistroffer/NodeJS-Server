import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { findOneByUsernameOrEmail } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { IUserDoc } from "@/defs/interfaces";

interface IAuthResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class AuthController {
  static async authenticate(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { usernameOrEmail, password } = req.body;

    try {
      // Find user by username or email
      const user = await findOneByUsernameOrEmail(usernameOrEmail, usernameOrEmail) as IUserDoc;
      if (!user) {
        return res
          .status(statusCodes.invalid_usernameOrEmail_and_password)
          .json(userResponses.invalid_usernameOrEmail_and_password("Invalid username/email or password"));
      }

      // Verify password
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(statusCodes.invalid_usernameOrEmail_and_password)
          .json(userResponses.invalid_usernameOrEmail_and_password("Invalid username/email or password"));
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res
          .status(statusCodes.invalid_request)
          .json(genericResponses.invalid_request("Please verify your email before logging in"));
      }

      // Generate JWT token
      const token = sign(
        { userId: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Prepare user data for response
      const { password: _, usernameNormalized, emailNormalized, ...sanitizedUser } = user;

      // Return token and user data
      const response: IAuthResponse = {
        token,
        user: sanitizedUser as any,
      };

      return res.status(statusCodes.success).json(genericResponses.success(response as any));
    } catch (error) {
      console.error("Authentication error:", error);
      return res
        .status(statusCodes.caught_error)
        .json(genericResponses.caught_error(error));
    }
  }
} 