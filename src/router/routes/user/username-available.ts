"use strict";

import * as express from "express";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { responses as userResponses } from "../../../defs/responses/user";
import { usersCollection } from "../../../db";
import { verifyToken } from "../../../middleware";
import { findOneByUsername } from "../../../operations/user_operations";
import { logUncaughtException } from "../../../utils";
import { EMessageType } from "../../../defs/enums";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic";
const router = express.Router();

router.post(
  "/",
  body("username").notEmpty().bail().isString().bail().escape(),
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedErrors = validationResult(req).array();
      if (validatedErrors.length) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      const doc = await findOneByUsername(req.body.username);

      const isAvailable = !doc;
      return res.json(genericResponses.success(isAvailable));
    } catch (error) {
      return res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
