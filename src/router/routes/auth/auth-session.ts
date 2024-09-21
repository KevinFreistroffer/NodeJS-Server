"use strict";

import * as express from "express";
import {
  IResponse,
  responses,
  statusCodes,
} from "../../../defs/responses/generic";
import { handleCaughtErrorResponse } from "../../../utils";

const router = express.Router();

router.get(
  "/",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      // TODO: implement
      return res
        .status(statusCodes.access_denied)
        .json(responses.access_denied());
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
