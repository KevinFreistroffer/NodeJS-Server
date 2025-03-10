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
    console.log("GET /user/users");
    try {
      const doc = await findAllUsers();
      console.log("DOC", doc);
      return res.json(genericResponses.success(doc));
    } catch (error) {
      console.log("ERROR", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
