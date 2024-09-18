"use strict";

import express from "express";
import moment from "moment";
// import { User } from "../../../defs/models/user.model";

import { IJournal, ISanitizedUser } from "../../../../defs/interfaces";
import { body, validationResult } from "express-validator";
import { responses as userResponses } from "../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic_responses";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../../middleware";
import { UserProjection } from "../../../../defs/models/user.model";
import {
  findOne,
  findOneById,
  updateOne,
} from "../../../../operations/user_operations";
import { logUncaughtException } from "../../../../utils";
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
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      /*--------------------------------------------------
       * Valid request body.
       * MongoDB User collection
       *------------------------------------------------*/
      const { userId, title, entry, category } = req.body;

      let day = moment().day();
      let date = `${days[day]}, ${moment().format("MM-DD-YYYY")}`;
      const journal: IJournal = {
        title,
        entry,
        category,
        date, // convert to createdDate
        // add updatedDate
        selected: false, // ???
      };

      /*--------------------------------------------------
       *  Update user's journals
       *------------------------------------------------*/
      // const doc = await users.findOneAndUpdate({ _id: new ObjectId(userId) });
      const doc = await updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        {
          $addToSet: {
            journals: {
              ...journal,
            },
            journalCategories: {
              category,
              selected: false,
            },
          },
        }
      );

      if (!doc.acknowledged || !doc.upsertedId) {
        return res.json(userResponses.could_not_update());
      }

      const foundDoc = await findOneById(new ObjectId(doc.upsertedId));

      if (!foundDoc) {
        return res.json(userResponses.user_not_found());
      }

      return res.json(genericResponses.success(foundDoc));
    } catch (error) {
      res.json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
