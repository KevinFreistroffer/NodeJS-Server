"use strict";

import * as express from "express";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { ObjectId } from "mongodb";
import {
  findOneById,
  updateMany,
} from "../../../../operations/user_operations";
import { responses as userResponses } from "../../../../defs/responses/user";
import { handleCaughtErrorResponse } from "../../../../utils";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic";
import { statusCodes } from "../../../../defs/responses/status_codes";

const router = express.Router();
const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .custom((id) => ObjectId.isValid(id))
  .withMessage("Invalid userId")
  .bail()
  .escape();

const validatedJournalIds = body("journalIds") // TODO convert to zod?
  .notEmpty()
  .bail()
  .isArray({ min: 1 })
  .custom((ids: string[]) => ids.every((id) => ObjectId.isValid(id)))
  .withMessage("Invalid journalIds")
  .bail()
  .escape();
const validatedStrings = body(["title", "journal", "category"])
  .optional()
  .isString()
  .bail()
  .escape();
const validatedFavorite = body("favorite").optional().isBoolean().escape();

// TODO validate title journal category

router.post(
  "/",
  validatedUserId,
  validatedJournalIds,
  validatedStrings,
  validatedFavorite,
  async (
    req: express.Request<
      {},
      {},
      {
        userId: string;
        journalIds: string[];
        title?: string;
        journal?: string;
        category?: string;
        favorite?: boolean;
      }
    >,
    res: express.Response<IResponse>
  ) => {
    try {
      const errors = validationResult(req);

      if (
        !errors.isEmpty() ||
        (!has(req.body, "title") &&
          !has(req.body, "journal") &&
          !has(req.body, "category") &&
          !has(req.body, "favorite"))
      ) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { userId, journalIds, title, journal, category, favorite } =
        req.body;
      const query: {
        ["journals.$.title"]?: string;
        ["journals.$.entry"]?: string;
        ["journals.$.category"]?: string;
        ["journals.$.favorite"]?: boolean;
      } = {};

      if (title) {
        query["journals.$.title"] = title;
      }

      if (journal) {
        query["journals.$.entry"] = journal;
      }

      if (category) {
        query["journals.$.category"] = category;
      }

      if (favorite !== undefined) {
        query["journals.$.favorite"] = Boolean(favorite); // TODO: why is the boolean getting converted to a string?
      }

      const doc = await updateMany(
        {
          _id: new ObjectId(userId),
          "journals._id": { $in: journalIds.map((id) => new ObjectId(id)) },
        },
        {
          $set: query,
        }
        //{ new: true } // What is this?????
      );

      if (!doc.matchedCount) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      if (!doc.modifiedCount) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update());
      }

      const userDoc = await findOneById(ObjectId.createFromHexString(userId));

      if (!userDoc) {
        return res
          .status(statusCodes.user_not_found)
          .json(
            userResponses.user_not_found("Could not find the updated user.")
          );
      }

      return res
        .status(statusCodes.success)
        .json(genericResponses.success(userDoc));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
