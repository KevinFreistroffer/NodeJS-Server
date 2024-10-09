"use strict";

import * as express from "express";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { ObjectId } from "mongodb";
import { findOneById, updateOne } from "../../../../operations/user_operations";
import { responses as userResponses } from "../../../../defs/responses/user";
import { handleCaughtErrorResponse } from "../../../../utils";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic";
import { statusCodes } from "../../../../defs/responses/status_codes";

const router = express.Router();
const validatedIds = body(["userId", "journalId"]) // TODO convert to zod?
  .notEmpty()
  .bail()
  .custom((id) => ObjectId.isValid(id))
  .withMessage("Invalid userId or journalId")
  .bail()
  .escape();
const validatedStrings = body(["title", "journal", "category"])
  .optional()
  .isString()
  .escape();

const validatedFavorite = body("favorite").optional().isBoolean().escape();

// TODO validate title journal category

router.post(
  "/",
  validatedIds,
  validatedStrings,
  validatedFavorite,
  async (
    req: express.Request,

    res: express.Response<IResponse>
  ) => {
    try {
      const errors = validationResult(req);
      console.log(errors);
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

      const { userId, journalId, title, journal, category, favorite } =
        req.body;
      const query: {
        ["journals.$.title"]?: string;
        ["journals.$.journal"]?: string;
        ["journals.$.category"]?: string;
        ["journals.$.favorite"]?: boolean;
      } = {};

      if (title) {
        query["journals.$.title"] = title;
      }

      if (journal) {
        query["journals.$.journal"] = journal;
      }

      if (category) {
        query["journals.$.category"] = category;
      }

      const doc = await updateOne(
        {
          _id: ObjectId.createFromHexString(userId),
          "journals._id": ObjectId.createFromHexString(journalId),
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
