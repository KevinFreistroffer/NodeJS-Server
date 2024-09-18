"use strict";

import * as express from "express";
import {
  IResponse,
  responses,
  statusCodes,
} from "../../../defs/responses/generic";

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
      return res
        .status(statusCodes.caught_error)
        .json(responses.caught_error(error));
    }
  }
);

module.exports = router;
