"use strict";

import * as express from "express";
import { body, validationResult } from "express-validator";

import { findOneByUsername } from "../../../operations/user_operations";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic";
import {
  responses as userResponses,
  IUsernameAvailableResponse,
} from "../../../defs/responses/user";
import { statusCodes } from "../../../defs/responses/status_codes";
import { handleCaughtErrorResponse } from "../../../utils";

const router = express.Router();

router.post(
  "/",
  body("username").notEmpty().bail().isString().bail().escape(),
  async (
    req: express.Request,
    res: express.Response<IUsernameAvailableResponse | IResponse>
  ) => {
    try {
      const validatedErrors = validationResult(req).array();
      if (validatedErrors.length) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const doc = await findOneByUsername(req.body.username);

      const isAvailable = !doc;

      return res
        .status(statusCodes.success)
        .json(userResponses.username_available(isAvailable));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
