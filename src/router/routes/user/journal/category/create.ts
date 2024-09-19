"use strict";

import * as express from "express";

import { body, validationResult } from "express-validator";

import { Types } from "mongoose";
import { usersCollection } from "../../../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../../../middleware";
import { updateOne } from "../../../../../operations/user_operations";
import { responses as userResponses } from "../../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../../defs/responses/generic_responses";
import { logUncaughtException } from "../../../../../utils";

const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .custom((id) => Types.ObjectId.isValid(id))
  .bail()
  .escape();
const validatedJournal = body("category") // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .custom((category) => typeof category === "string")
  .escape();
const router = express.Router();

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

      const { userId, category } = req.body;
      const doc = await updateOne(
        {
          _id: new ObjectId(userId),
        },
        {
          $addToSet: {
            journalCategories: {
              _id: new ObjectId(),
              category,
              selected: false,
            },
          },
        }
      );


      if (!doc.matchedCount) {
        return res.json(
          userResponses.user_not_found(
            "User not found, or the category already exists."
          )
        );
      }

      if (doc.modifiedCount === 0) {
        return res.json(userResponses.could_not_update("User not updated."));
      }

      return res.json(genericResponses.success());
    } catch (error) {
      res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
