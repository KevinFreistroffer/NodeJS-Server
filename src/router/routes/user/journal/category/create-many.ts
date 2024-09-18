import {
  ICategory,
  IJournalDoc,
  ISanitizedUser,
  IUser,
  // IUserDoc,
} from "../../../../../defs/interfaces";
// import { User } from "../../../defs/models/user.model";
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
  async (
    req: express.Request<
      never,
      never,
      { userId: string; journalIds: string[]; category: string }
    >,
    res: express.Response<IResponse>
  ) => {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        console.log(validatedFields);
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
      doc.journals.forEach((journal) => {
        if (
          journalIds.includes(
            ((journal as IJournalDoc)._id as ObjectId).toString()
          )
        ) {
          journal.category = category;
        }
      });

      /*--------------------------------------------------
       *  Save the updated user.journals
       *------------------------------------------------*/
      const updatedDoc = await updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            journals: doc.journals,
          },
        }
      );

      if (!updatedDoc.acknowledged) {
        return res.json(userResponses.could_not_update());
      }

      const savedDoc = await findOneById(new ObjectId(userId));

      if (!savedDoc) {
        return res.json(
          userResponses.user_not_found(
            "Categories successfully updated, however finding the updated user returned no doc. Try again."
          )
        );
      }

      return res.json(genericResponses.success(savedDoc));
    } catch (error) {
      return res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
