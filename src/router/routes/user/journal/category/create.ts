"use strict";

import * as express from "express";
import { body, validationResult, query } from "express-validator";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { Category } from "../../../../../defs/models/category.model";
import {
  updateOne,
  findOneById,
} from "../../../../../operations/user_operations";
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
const validatedReturnUser = query("returnUser")
  .optional()
  .isString()
  .bail()
  .custom((value) => {
    if (value && !["true", "false"].includes(value.toLowerCase())) {
      throw new Error(
        'returnUser must be "true" or "false" (case insensitive)'
      );
    }
    return true;
  });

const router = express.Router();

router.post(
  "/",
  validatedUserId,
  validatedJournal,
  validatedReturnUser,
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const { returnUser } = req.query;
      console.log("returnUser", returnUser);

      let query: { returnUser?: boolean } = {};

      if (returnUser) {
        query.returnUser = returnUser === "true";
      }

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
            journalCategories: {
              _id: new ObjectId(),
              ...newCategory,
            },
          },
        }
      );

      console.log("doc", doc);

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

      if (query.returnUser) {
        const user = await findOneById(new ObjectId(userId));

        if (!user) {
          return res
            .status(statusCodes.user_not_found)
            .json(userResponses.user_not_found("User not found."));
        }

        return res
          .status(statusCodes.success)
          .json(genericResponses.success(user));
      }

      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      console.log("ERROR", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
