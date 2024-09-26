"use strict";

import * as express from "express";
import {
  IResponse,
  responses,
  statusCodes,
} from "../../../defs/responses/generic";
import { handleCaughtErrorResponse } from "../../../utils";
import { findOneById } from "../../../operations/user_operations";
import { ObjectId } from "mongodb";
import { sendAccountActivationEmail } from "../../../utils";
const router = express.Router();

router.get(
  "/:userId",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const { userId } = req.params;

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
    } catch (error) {
      console.log("error: ", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
