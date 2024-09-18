import * as express from "express";
import { body, validationResult } from "express-validator";
import { IJournal, ISanitizedUser, IUser } from "../../../../defs/interfaces";
import { Types } from "mongoose";
import { usersCollection } from "../../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../../middleware";
import { updateOne } from "../../../../operations/user_operations";
import { responses as userResponses } from "../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic_responses";
import { logUncaughtException } from "../../../../utils";

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

interface IRequestBody {
  userId: Types.ObjectId;
  journalIds: Types.ObjectId[];
}

const router = express.Router();

router.put(
  "/",
  validatedUserId,
  validatedJournalIds,
  async (
    req: express.Request<any, any, IRequestBody>,
    res: express.Response<IResponse>
  ) => {
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
      return res.json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
