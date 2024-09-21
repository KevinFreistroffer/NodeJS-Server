"use strict";

import * as express from "express";
import { body, validationResult } from "express-validator";

import { findOneByUsername } from "../../../operations/user_operations";

import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic";
import { rateLimit } from "express-rate-limit";
import { handleCaughtErrorResponse } from "../../../utils";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 5, // Limit each IP to 5 create account requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
const router = express.Router();

router.post(
  "/",
  limiter,
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
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
