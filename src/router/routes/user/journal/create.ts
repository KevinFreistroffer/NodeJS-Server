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
import { Types } from "mongoose";
import { ObjectId } from "mongodb";

import { findOneById, updateOne } from "../../../../operations/user_operations";
import { handleCaughtErrorResponse } from "../../../../utils";

const router = express.Router();
const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .custom((id) => Types.ObjectId.isValid(id))
  .escape();
const validatedJournal = body(["title", "entry", "category"]) // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedUserId,
  validatedJournal,
  async (req: express.Request, res: express.Response<IResponse>) => {
    console.log(req.cookies);
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
      const { userId, title, entry, category } = req.body;
      console.log("userId", userId);
      const day = moment().day();
      const date = `${days[day]}, ${moment().format("MM-DD-YYYY")}`;
      const journal = new Journal(title, entry, category, date, false);
      console.log("JOURNAL", journal);

      /*--------------------------------------------------
       *  Update user's journals
       *------------------------------------------------*/
      // const doc = await users.findOneAndUpdate({ _id: new ObjectId(userId) });
      const doc = await updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            _id: new ObjectId(),
            journals: journal,
            journalCategories: {
              category,
              selected: false,
            },
          },
        }
      );

      console.log("DOC", doc);

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
      console.log("error: ", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
