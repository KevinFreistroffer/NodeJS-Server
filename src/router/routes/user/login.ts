"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { responses, statusCodes } from "../../../defs/responses/user";
import { findOne } from "../../../operations/user_operations";
import { handleCaughtErrorResponse } from "../../../utils";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic_responses";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 30 minutes
  max: 5, // Limit each IP to 5 create account requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

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
  limiter,
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

      const foundUser = await findOne({
        query: {
          $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        },
        sanitize: true,
      });

      if (!foundUser) {
        return res
          .status(statusCodes.user_not_found)
          .json(responses.user_not_found());
      }

      /*-----------------------------------------------------
       * Generate a JWT
       *---------------------------------------------------*/
      let token;
      if (staySignedIn) {
        // const timeStamp = moment().add(14, "days");

        if (!process.env.JWT_SECRET || !process.env.JWT_TOKEN_EXPIRES_IN) {
          throw new Error("JWT credentials are not set in the environment.");
        }

        token = sign(
          { data: UNSAFE_DOC._id.toString() },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
          }
        );

        if (!token) {
          throw new Error("Error generating JWT token.");
        }
      }

      // TODO: make a single function that handles returning responses, and uses the convertDocToSafeUser
      return res.json({
        ...responses.success(),
        data: {
          ...responses.success().data,
          user: foundUser, // TODO fix this response
          token,
        },
      });
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
