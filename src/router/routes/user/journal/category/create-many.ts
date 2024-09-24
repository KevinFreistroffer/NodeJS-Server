import { IJournal } from "../../../../../defs/interfaces";
import * as express from "express";
import { body, validationResult } from "express-validator";
import { responses as userResponses } from "../../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../../defs/responses/generic";
import { ObjectId } from "mongodb";
import {
  findOneById,
  updateOne,
} from "../../../../../operations/user_operations";
import { handleCaughtErrorResponse } from "../../../../../utils";
const router = express.Router();

const validatedJournalIds = body("journalIds")
  .isArray({ min: 1 })
  .bail()
  .custom((value) => value.every((id: string) => ObjectId.isValid(id)))
  .bail()
  .escape();
const validatedStrings = body(["userId", "category"])
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedStrings,
  validatedJournalIds,
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      const { userId, journalIds, category } = req.body;

      const doc = await findOneById(new ObjectId());

      /*--------------------------------------------------
       *  User not found
       *------------------------------------------------*/
      if (!doc) {
        return res.json(userResponses.user_not_found());
      }

      /*--------------------------------------------------
       *  Set the journal category on each journal
       *------------------------------------------------*/
      doc.journals.forEach((journal: IJournal) => {
        if (
          journalIds.includes(
            ((journal as IJournal)._id as ObjectId).toString()
          )
        ) {
          journal.category = category;
        }
      });

      /*--------------------------------------------------
       *  Save the updated user.journals
       *------------------------------------------------*/
      const updatedDoc = await updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        {
          $set: {
            journals: doc.journals,
          },
        }
      );

      if (!updatedDoc.acknowledged) {
        return res.json(userResponses.could_not_update());
      }

      const savedDoc = await findOneById(ObjectId.createFromHexString(userId));

      if (!savedDoc) {
        return res.json(
          userResponses.user_not_found(
            "Categories successfully updated, however finding the updated user returned no doc. Try again."
          )
        );
      }

      return res.json(genericResponses.success(savedDoc));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
