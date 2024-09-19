"use strict";

import * as express from "express";

import * as bcrypt from "bcryptjs";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic";
import { findAllUsers } from "../../../operations/user_operations";
const router = express.Router();

router.get(
  "/",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const doc = await findAllUsers();

      return res.json(genericResponses.success(doc));
    } catch (error) {

      return res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
