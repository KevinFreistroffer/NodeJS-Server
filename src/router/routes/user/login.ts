"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { responses, statusCodes } from "../../../defs/responses/user";
import { findOne } from "../../../operations/user_operations";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic_responses";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

interface IRequestBody {
  usernameOrEmail: string;
  password: string;
  staySignedIn?: boolean;
}

const validatedFields = body(["usernameOrEmail", "password"])
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedFields,
  async (
    req: express.Request<any, any, IRequestBody>,
    res: express.Response<IResponse>
  ) => {
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
      return res
        .status(statusCodes.caught_error)
        .json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
