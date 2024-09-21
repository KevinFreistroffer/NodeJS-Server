"use strict";

import * as express from "express";
import { User } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { responses, statusCodes } from "../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../defs/responses/generic_responses";
import { usersCollection } from "../../../db";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";
import {
  convertDocToSafeUser,
  logUncaughtException,
  hashPassword,
  handleCaughtErrorResponse,
} from "../../../utils";
import {
  findOneByUsernameOrEmail,
  findOneById,
  insertOne,
} from "../../../operations/user_operations";
import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 create account requests per windowMs
  message: "Too many accounts created from this IP, please try again later",
});

interface IRequestBody {
  username: string;
  email: string;
  password: string;
}

const router = express.Router();

router.post(
  "/",
  limiter,
  body([
    "username",
    // "userId",
    "password",
  ])
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape(),
  body("email").notEmpty().bail().isEmail().bail().escape(),
  async (
    req: express.Request<any, any, IRequestBody>,
    res: express.Response<IResponse>
  ) => {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { username, email, password } = req.body;
      const doc = await findOneByUsernameOrEmail(username, email);

      if (doc) {
        return res.json(responses.username_or_email_already_registered());
      }

      const insertDoc = await insertOne(new User(username, email, password));

      if (!insertDoc || !insertDoc.insertedId) {
        return res.json(responses.error_inserting_user());
      }

      const userDoc = await findOneById(insertDoc.insertedId);

      if (!userDoc) {
        return res.json(responses.user_not_found());
      }

      return res.json(responses.success(convertDocToSafeUser(userDoc)));
    } catch (error) {
      // MongoDB error types
      // WriteError = DuplicateKey
      // WriteConcernError =
      // if (error instanceof WriteError) {
      //   return res.json(responses.username_or_email_already_registered());
      // }

      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
