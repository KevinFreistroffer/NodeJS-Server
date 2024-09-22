"use strict";

import * as express from "express";
import { handleCaughtErrorResponse } from "../../../utils";
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
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
