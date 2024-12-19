"use strict";

import express from "express";
import moment from "moment";
import { Journal } from "../../../../defs/models/journal.model";
import { body, validationResult } from "express-validator";
import { responses as userResponses } from "../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic";
import { statusCodes } from "../../../../defs/responses/status_codes";
import { ObjectId } from "mongodb";

import { findOneById, updateOne } from "../../../../operations/user_operations";
import { handleCaughtErrorResponse } from "../../../../utils";

const router = express.Router();
const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .custom((id) => ObjectId.isValid(id))
  .escape();
const validatedJournal = body(["title", "entry"]) // Removed category from required fields
  .isString()
  .bail()
  .escape();

// Add separate optional category validation
const validatedCategory = body("category")
  .optional()
  .isString()
  .bail()
  .escape();

// Add specific validation for sentimentScore
const validatedSentimentScore = body("sentimentScore").isNumeric().bail();

router.post(
  "/",
  body("favorite").notEmpty().bail().isBoolean().bail().escape(),
  validatedUserId,
  validatedJournal,
  validatedCategory, // Add the optional category validator
  validatedSentimentScore,
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedFields = validationResult(req);

      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      /*--------------------------------------------------
       * Valid request body.
       * MongoDB User collection
       *------------------------------------------------*/
      const { userId, title, entry, category, favorite, sentimentScore } =
        req.body; // Added sentimentScore

      const day = moment().day();
      const newJournal = new Journal(
        title,
        entry,
        category
          ? [
              {
                _id: new ObjectId(),
                category,
                selected: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]
          : [], // Make categories array empty if no category provided
        false,
        favorite,
        sentimentScore // Added sentimentScore
      );

      /*--------------------------------------------------
       *  Update user's journals
       *------------------------------------------------*/
      // const doc = await users.findOneAndUpdate({ _id: new ObjectId(userId) });
      const existingUser = await findOneById(new ObjectId(userId));

      if (!existingUser) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      const categoryExists = existingUser?.journalCategories?.some(
        (cat) => cat.category.toLowerCase() === category.toLowerCase()
      );

      const doc = await updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            journals: {
              ...newJournal,
              _id: new ObjectId(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          ...(category && !categoryExists
            ? {
                // Only add category if it's provided and doesn't exist
                $push: {
                  journalCategories: {
                    _id: new ObjectId(),
                    category,
                    selected: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                },
              }
            : {}),
        }
      );

      if (!doc?.acknowledged || !doc.modifiedCount) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update());
      }

      const foundDoc = await findOneById(new ObjectId(userId));

      if (!foundDoc) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      return res
        .status(statusCodes.success)
        .json(genericResponses.success(foundDoc));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
