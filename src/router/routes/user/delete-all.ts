"use strict";

import config from "../../../config";
import * as express from "express";
import * as bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { IUser } from "../../../defs/interfaces";
import {
  responses,
  IResponse,
} from "../../../defs/responses/generic_responses";
import { usersCollection } from "../../../db";
import { verifyToken } from "../../../middleware";
import { deleteMany } from "../../../operations/user_operations";
import { logUncaughtException } from "../../../utils";
const router = express.Router();

router.delete(
  "/",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      // Find user by username or email
      // TODO: how to get the updated doc?
      const doc = await deleteMany();

      if (!doc) {
        throw new Error("Users not deleted. No error. Not sure why.");
      }

      // TODO: return []? Or fetch the db again, which is obviously the better idea.
      return res.json(responses.success());
    } catch (error) {
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
