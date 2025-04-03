"use strict";

import * as express from "express";
import { responses, IResponse } from "../../../defs/responses/generic";
import { handleCaughtErrorResponse, asyncRouteHandler } from "../../../utils";
import { deleteMany } from "../../../operations/user_operations";
import { statusCodes } from "../../../defs/responses/status_codes";
const router = express.Router();

router.delete(
  "/",
  asyncRouteHandler(async (req: express.Request, res: express.Response<IResponse>) => {
    // Find user by username or email
    // TODO: how to get the updated doc?
    const doc = await deleteMany();

    if (!doc) {
      throw new Error("Users not deleted. No error. Not sure why.");
    }

    // TODO: return []? Or fetch the db again, which is obviously the better idea.
    return res.status(statusCodes.success).json(responses.success());
  })
);

module.exports = router;
