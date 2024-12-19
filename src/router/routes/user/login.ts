"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { responses, statusCodes } from "@/defs/responses/user";
import { findOne } from "@/operations/user_operations";
import {
  IResponse,
  responses as genericResponses,
} from "@/defs/responses/generic";
import dotenv from "dotenv";
import { ISanitizedUser } from "@/defs/interfaces";
import { ObjectId } from "mongodb";
import {
  handleCaughtErrorResponse,
  sendAccountActivationEmail,
  sanitizeUser,
  formatSessionCookie,
  getAvatarStream,
  streamToDataURL,
} from "@/utils";
dotenv.config();

const router = express.Router();

const validatedFields = body(["usernameOrEmail", "password"])
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedFields,
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validStaySignedIn = has(req.body, "staySignedIn")
        ? typeof req.body.staySignedIn === "boolean"
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

      if (!UNSAFE_DOC) {
        return res
          .status(statusCodes.user_not_found)
          .json(responses.user_not_found());
      }

      /*--------------------------------------------------
       * Compare passwords.
       *------------------------------------------------*/

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

      if (!sanitizedUser.isVerified) {
        await sendAccountActivationEmail(
          sanitizedUser.email,
          (sanitizedUser._id as ObjectId).toString()
        );
      }

      /*-----------------------------------------------------
       * Generate a Session token
       *---------------------------------------------------*/
      if (!process.env.JWT_SECRET || !process.env.JWT_TOKEN_EXPIRES_IN) {
        throw new Error("JWT credentials are not set in the environment.");
      }

      const token = sign(
        { data: UNSAFE_DOC._id.toString() },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
        }
      );

      if (!token) {
        throw new Error("Error generating JWT token.");
      }
      if (staySignedIn) {
        // TODO: Implement session token
      }

      res.set(formatSessionCookie(token));
      // TODO: make a single function that handles returning responses, and uses the convertDocToSafeUser
      const description = sanitizedUser.isVerified
        ? ""
        : "Login successful, but the account is not verified. A verification email was sent.";

      return res.json({
        ...responses.success(sanitizedUser, description),
      });
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
