"use strict";

import * as express from "express";
import { body } from "express-validator";
import { responses as userResponses } from "../../../defs/responses/user";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic";
import { findOneByEmail } from "../../../operations/user_operations";

import { validationResult } from "express-validator";
import { handleCaughtErrorResponse } from "../../../utils";


const router = express.Router();

router.post(
  "/",
  body("email").isEmail().bail().escape(),
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedErrors = validationResult(req).array();
      if (validatedErrors.length) {
        return res.status(422).json();
      }

      const email = req.body.email;
      const doc = await findOneByEmail(email);

      if (!doc) {
        return res.json(userResponses.email_available(true));
      }

      return res.json(userResponses.email_available(false));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
