"use strict";

import * as express from "express";
import {
  responses,
  IResponse,
} from "../../../defs/responses/generic_responses";
import { handleCaughtErrorResponse } from "../../../utils";
import { deleteMany } from "../../../operations/user_operations";
const router = express.Router();

router.delete(
  "/",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      // Find user by username or email
      // TODO: how to get the updated doc?
      const doc = await deleteMany();

      if (!doc) {
        throw new Error("Users not deleted. No error. Not sure why.");
      }

      // TODO: return []? Or fetch the db again, which is obviously the better idea.
      return res.json(responses.success());
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
