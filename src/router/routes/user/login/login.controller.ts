import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sign } from "jsonwebtoken";
import { has } from "lodash";
import { responses, statusCodes } from "@/defs/responses/user";
import { findOne } from "@/db/operations/user_operations";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { ISanitizedUser } from "@/defs/interfaces";
import { ObjectId } from "mongodb";
import {
  sendAccountActivationEmail,
  sanitizeUser,
  formatSessionCookie,
  getAvatarStream,
  streamToDataURL,
} from "@/utils";
import * as bcrypt from "bcryptjs";

export class LoginController {
  static async login(req: Request, res: Response<IResponse>, next: NextFunction) {
    console.log(req.body);
    try {
      const validStaySignedIn = has(req.body, "staySignedIn")
        ? req.body.staySignedIn === "true" || req.body.staySignedIn === "false"
          ? true
          : false
        : true;
      const validatedResults = validationResult(req);
      if (validatedResults.array().length || !validStaySignedIn) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { usernameOrEmail, password, staySignedIn } = req.body;
      const UNSAFE_DOC = await findOne({
        query: {
          $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        },
        sanitize: false,
      });
      console.log("UNSAFE_DOC", UNSAFE_DOC)

      if (!UNSAFE_DOC) {
        return res
          .status(statusCodes.user_not_found)
          .json(responses.user_not_found());
      }

      const passwordsMatch = await bcrypt.compare(
        password,
        UNSAFE_DOC.password
      );

      if (!passwordsMatch) {
        return res
          .status(statusCodes.invalid_password)
          .json(responses.invalid_password());
      }

      // Sanitize the UNSAFE_DOC to return an ISanitizedUser interface
      const sanitizedUser = sanitizeUser(UNSAFE_DOC);

      const avatarStream = await getAvatarStream(UNSAFE_DOC._id.toString());

      // Add avatar data if available
      if (avatarStream) {
        sanitizedUser.avatar = {
          _id: avatarStream._id,
          data: await streamToDataURL(
            avatarStream.stream,
            avatarStream.contentType || ""
          ),
          contentType: avatarStream.contentType || "",
        };
      }

      const token = sign(
        { data: UNSAFE_DOC._id.toString() },
        process.env.JWT_SECRET as string,
        {
          expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
        }
      );

      if (!token) {
        throw new Error("Error generating JWT");
      }

      res.set(formatSessionCookie(token));

      return res.json(genericResponses.success(sanitizedUser));
    } catch (error) {
      console.log("error", error)
      next(error);
    }
  }
} 