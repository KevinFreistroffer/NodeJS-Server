import * as express from "express";
import { Router } from "express";
import { verifyJWT } from "../../../utils";
import { findOneById, updateOne } from "../../../operations/user_operations";
import * as jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import {
  responses as genericResponses,
  IResponse,
  statusCodes,
} from "../../../defs/responses/generic";
import { responses as userResponses } from "../../../defs/responses/user";
import { handleCaughtErrorResponse, asyncRouteHandler } from "../../../utils";
const router = Router();

router.get("/:token", asyncRouteHandler(async (req: express.Request, res: express.Response<IResponse>) => {

  const { token } = req.params;

  if (!token) {
    return res
      .status(statusCodes.missing_parameters)
      .json(genericResponses.missing_parameters());
  }

  const decoded = verifyJWT(token);

  if (
    typeof decoded === "object" &&
    decoded !== null &&
    "userId" in decoded
  ) {
    // Find the user by the decoded user ID
    const user = await findOneById(
      ObjectId.createFromHexString(decoded.userId)
    );

    if (!user) {
      return res
        .status(statusCodes.resource_not_found)
        .json(genericResponses.resource_not_found());
    }

    if (user.isVerified) {
      return res.json(
        genericResponses.success(undefined, "Account is already verified")
      );
    }

    const updateResult = await updateOne(
      { _id: user._id },
      { $set: { isVerified: true } }
    );

    if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
      return res.json(userResponses.could_not_update());
    }

    return res.json(genericResponses.success(undefined, "Account verified"));
  }

  return res
    .status(statusCodes.access_denied)
    .json(genericResponses.access_denied());

}));

module.exports = router;
