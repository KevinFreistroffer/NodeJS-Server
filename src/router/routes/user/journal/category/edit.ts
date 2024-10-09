"use strict";

import * as express from "express";
import { body, validationResult } from "express-validator";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { updateOne } from "../../../../../operations/user_operations";
import { responses as userResponses } from "../../../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../../defs/responses/generic";
import { statusCodes } from "../../../../../defs/responses/status_codes";
import { handleCaughtErrorResponse } from "../../../../../utils";

const router = express.Router();

const validatedUserId = body("userId")
  .notEmpty()
  .bail()
  .custom((id) => ObjectId.isValid(id))
  .withMessage("Invalid userId")
  .escape();

const validatedCategoryId = body("categoryId")
  .notEmpty()
  .bail()
  .custom((id) => ObjectId.isValid(id))
  .withMessage("Invalid categoryId")
  .escape();

const validatedCategory = body("category")
  .optional()
  .isString()
  .withMessage("Category must be a string")
  .trim()
  .escape();

const validatedSelected = body("selected")
  .optional()
  .isBoolean()
  .withMessage("Selected must be a boolean");

const validateFields = [
  validatedUserId,
  validatedCategoryId,
  validatedCategory,
  validatedSelected,
];

router.put(
  "/",
  validateFields,
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { userId, categoryId, category, selected } = req.body;

      if (selected === undefined && !category) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const query: {
        ["journalCategories.$.category"]?: string;
        ["journalCategories.$.selected"]?: boolean;
      } = {};

      if (category) {
        query["journalCategories.$.category"] = category;
      }

      if (selected) {
        query["journalCategories.$.selected"] = selected;
      }

      const updatedDoc = await updateOne(
        {
          _id: ObjectId.createFromHexString(userId),
          "journalCategories._id": ObjectId.createFromHexString(categoryId),
        },
        {
          $set: query,
        }
      );

      if (!updatedDoc.matchedCount) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      if (!updatedDoc.modifiedCount) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update());
      }

      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
