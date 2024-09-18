"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { InsertOneResult, WriteError } from "mongodb";
import { UserProjection } from "../../../defs/models/user.model";
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
} from "../../../utils";
import {
  findOneByUsernameOrEmail,
  findOneById,
  insertOne,
} from "../../../operations/user_operations";
const router = express.Router();

interface IRequestBody {
  username: string;
  email: string;
  password: string;
}

router.post(
  "/",
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

      const insert = {
        username,
        usernameNormalized: username.toLowerCase(),
        email,
        emailNormalized: email.toLowerCase(),
        password: await hashPassword(password),
        resetPasswordToken: "",
        // jwtToken: "",
        journals: [],
        journalCategories: [],
      };

      const insertDoc = await insertOne({
        username,
        usernameNormalized: username.toLowerCase(),
        email,
        emailNormalized: email.toLowerCase(),
        password: await hashPassword(password),
        resetPasswordToken: "",
        // jwtToken: "",
        journals: [],
        journalCategories: [],
      });

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

      return res
        .status(statusCodes.caught_error)
        .json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
