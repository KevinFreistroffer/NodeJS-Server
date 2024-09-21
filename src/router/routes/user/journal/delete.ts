import * as express from "express";
import { body, validationResult } from "express-validator";
import { Types } from "mongoose";
import { updateOne } from "../../../../operations/user_operations";
import { responses as userResponses } from "../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic_responses";
import { handleCaughtErrorResponse } from "../../../../utils";

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
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedResults = validationResult(req);

      if (!validatedResults.isEmpty()) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      const { userId, journalIds } = req.body;
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
        return res.json(userResponses.user_not_found());
      }

      if (!updatedDoc.modifiedCount) {
        return res.json(userResponses.user_not_found());
      }

      return res.json(genericResponses.success());
    } catch (error) {
      console.log("error: ", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
