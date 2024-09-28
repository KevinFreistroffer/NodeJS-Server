"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { responses, statusCodes } from "../../../defs/responses/user";
import { findOne } from "../../../operations/user_operations";
import {
  handleCaughtErrorResponse,
  sendAccountActivationEmail,
} from "../../../utils";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic_responses";
import dotenv from "dotenv";
import { ISanitizedUser } from "../../../defs/interfaces";
import { ObjectId } from "mongodb";
import { sanitizeUser } from "../../../utils";
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
      console.log("Request cookies:", req.cookies);
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

      // $2a$10$QSgxeCPndMOXaU0jD/vsTegda4C6o4uE4ThW5F7yUO0WZOx.C1lju

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

      console.log("passwordsMatch", passwordsMatch);

      if (!passwordsMatch) {
        return res
          .status(statusCodes.invalid_password)
          .json(responses.invalid_password());
      }

      // Sanitize the UNSAFE_DOC to return an ISanitizedUser interface
      const sanitizedUser = sanitizeUser(UNSAFE_DOC);

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

      res.set({
        "Access-Control-Allow-Origin": "*", // Allow all origins (or specify your frontend's origin)
        "Access-Control-Expose-Headers": "Set-Cookie",
        "Set-Cookie": `session_token=${token}; HttpOnly; ${
          process.env.NODE_ENV === "production" ? "Secure; " : ""
        }Max-Age=${14 * 24 * 60 * 60};  SameSite=None${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`,
      });
      // TODO: make a single function that handles returning responses, and uses the convertDocToSafeUser
      const description = sanitizedUser.isVerified
        ? ""
        : "Login successful, but the account is not verified. A verification email was sent.";

      return res.json({
        ...responses.success(sanitizedUser, description),
      });
    } catch (error) {
      console.log("error", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
