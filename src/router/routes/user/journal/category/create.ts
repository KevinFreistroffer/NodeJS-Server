"use strict";

import * as express from "express";
import { body, validationResult } from "express-validator";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { Category } from "../../../../../defs/models/category.model";
import { updateOne } from "../../../../../operations/user_operations";
import { responses as userResponses } from "../../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../../defs/responses/generic";
import { statusCodes } from "../../../../../defs/responses/status_codes";
import { handleCaughtErrorResponse } from "../../../../../utils";
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
      console.log(req.body);
      const validatedFields = validationResult(req);
      console.log("validatedFields", validatedFields);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { userId, category } = req.body;
      const newCategory = new Category(category, false);
      const doc = await updateOne(
        {
          _id: new ObjectId(userId),
        },
        {
          $addToSet: {
            _id: new ObjectId(userId),
            journalCategories: newCategory,
          },
        }
      );

      if (!doc.matchedCount) {
        return res
          .status(statusCodes.user_not_found)
          .json(
            userResponses.user_not_found(
              "User not found, or the category already exists."
            )
          );
      }

      if (doc.modifiedCount === 0) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update("User not updated."));
      }

      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
