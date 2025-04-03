import * as express from "express";
import { body, validationResult } from "express-validator";
import { Types } from "mongoose";
import { updateOne } from "../../../../operations/user_operations";
import { responses as userResponses } from "../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic";
import { statusCodes } from "../../../../defs/responses/status_codes";
import { handleCaughtErrorResponse, asyncRouteHandler } from "../../../../utils";

const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();
const validatedJournalIds = body("journalIds") // TODO convert to zod?
  .notEmpty()
  .bail()
  .isArray({ min: 1 })
  .bail()
  .custom((value) => value.every((id: any) => Types.ObjectId.isValid(id)))
  .escape();

const router = express.Router();

router.delete(
  "/",
  validatedUserId,
  validatedJournalIds,
  asyncRouteHandler(async (req: express.Request, res: express.Response<IResponse>) => {
    const validatedResults = validationResult(req);

    if (!validatedResults.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, journalIds } = req.body;

    const user = res.locals.user;

    const updatedDoc = await updateOne(
      { _id: userId },
      {
        $pull: {
          journals: {
            _id: {
              $in: journalIds,
            },
          },
        },
      }
    );

    if (!updatedDoc.matchedCount) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found());
    }

    if (!updatedDoc.modifiedCount) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update());
    }

    return res.status(statusCodes.success).json(genericResponses.success());
  })
);

module.exports = router;
