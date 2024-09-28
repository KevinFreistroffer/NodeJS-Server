"use strict";

import * as express from "express";
import { body } from "express-validator";
import { responses as userResponses } from "../../../defs/responses/user";
import { responses as genericResponses } from "../../../defs/responses/generic";
import { IResponse } from "../../../defs/responses/generic";
import { IEmailAvailableResponse } from "../../../defs/responses/user";
import { findOneByEmail } from "../../../operations/user_operations";
import { validationResult } from "express-validator";
import { statusCodes } from "../../../defs/responses/status_codes";
import { handleCaughtErrorResponse } from "../../../utils";

const router = express.Router();

router.post(
  "/",
  body("email").isEmail().bail().escape(),
  async (
    req: express.Request,
    res: express.Response<IEmailAvailableResponse | IResponse>
  ) => {
    try {
      const validatedErrors = validationResult(req).array();
      if (validatedErrors.length) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const email = req.body.email;
      const doc = await findOneByEmail(email);

      return res
        .status(statusCodes.success)
        .json(userResponses.email_available(!doc));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
