import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { findOneByUsernameOrEmail } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { IUserDoc, ISanitizedUser } from "@/defs/interfaces";

// Add type declaration for bcrypt
declare module "bcrypt" {
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

interface ILoginResponse {
  token: string;
  user?: ISanitizedUser;
}

export class AuthController {
  static async login(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { usernameOrEmail, password, returnUser } = req.body;

    // Find user by username or email
    const user = await findOneByUsernameOrEmail(usernameOrEmail) as IUserDoc;
    if (!user) {
      return res
        .status(statusCodes.invalid_usernameOrEmail_and_password)
        .json(userResponses.invalid_usernameOrEmail_and_password("Invalid username/email or password."));
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(statusCodes.invalid_usernameOrEmail_and_password)
        .json(userResponses.invalid_usernameOrEmail_and_password("Invalid username/email or password."));
    }

    // Generate JWT token
    const token = sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Prepare response
    const response: ILoginResponse = { token };
    if (returnUser) {
      const { password: _, usernameNormalized, emailNormalized, ...sanitizedUser } = user;
      response.user = sanitizedUser;
    }

    return res.status(statusCodes.success).json(genericResponses.success(response as any));
  }
} 