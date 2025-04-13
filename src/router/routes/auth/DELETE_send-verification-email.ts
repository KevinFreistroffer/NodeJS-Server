"use strict";

import * as express from "express";
import {
  IResponse,
  responses,
  statusCodes,
} from "../../../defs/responses/generic";
import { handleCaughtErrorResponse, asyncRouteHandler } from "../../../utils";
import { findOneById } from "../../../db/operations/user_operations";
import { ObjectId } from "mongodb";
import { sendAccountActivationEmail } from "../../../utils";
const router = express.Router();

router.get(
  "/:userId",
  asyncRouteHandler(async (req: express.Request, res: express.Response<IResponse>) => {

    const { userId } = req.params;
    console.log("SEND VERIFICATION EMAIL GET()()()()()");
    if (!userId) {
      return res
        .status(statusCodes.invalid_request)
        .json(responses.invalid_request());
    }

    const user = await findOneById(new ObjectId(userId));

    if (!user) {
      return res
        .status(statusCodes.resource_not_found)
        .json(responses.resource_not_found());
    }

    if (user.isVerified) {
      return res
        .status(statusCodes.access_denied)
        .json(responses.access_denied());
    }

    await sendAccountActivationEmail(user.email, user._id.toString());

    return res
      .status(statusCodes.success)
      .json(responses.success(undefined, "Verification email sent"));

  })
);

module.exports = router;
