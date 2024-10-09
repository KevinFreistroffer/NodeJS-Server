import { IEntry } from "../../../../../defs/interfaces";
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
import { statusCodes } from "../../../../../defs/responses/status_codes";
const router = express.Router();

const validatedEntryIds = body("entryIds")
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
  validatedEntryIds,
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { userId, entryIds, category } = req.body;

      const doc = await findOneById(new ObjectId());

      /*--------------------------------------------------
       *  User not found
       *------------------------------------------------*/
      if (!doc) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      /*--------------------------------------------------
       *  Set the entry category on each entry
       *------------------------------------------------*/
      doc.entries.forEach((entry: IEntry) => {
        if (entryIds.includes(((entry as IEntry)._id as ObjectId).toString())) {
          entry.category = category;
        }
      });

      /*--------------------------------------------------
       *  Save the updated user.entries
       *------------------------------------------------*/
      const updatedDoc = await updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        {
          $set: {
            entries: doc.entries.map((entry) => ({
              ...entry,
              _id: new ObjectId(entry._id),
            })),
          },
        }
      );

      if (!updatedDoc.acknowledged) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update());
      }

      const savedDoc = await findOneById(ObjectId.createFromHexString(userId));

      if (!savedDoc) {
        return res
          .status(statusCodes.user_not_found)
          .json(
            userResponses.user_not_found(
              "Categories successfully updated, however finding the updated user returned no doc. Try again."
            )
          );
      }

      return res
        .status(statusCodes.success)
        .json(genericResponses.success(savedDoc));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
