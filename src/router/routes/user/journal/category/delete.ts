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
import { logUncaughtExceptionAndReturn500Response } from "../../../../../utils";

const router = express.Router();

router.delete(
  "/:userId/:categoryId",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      if (
        !req.params.userId ||
        !req.params.categoryId ||
        !ObjectId.isValid(req.params.userId) ||
        !ObjectId.isValid(req.params.categoryId)
      ) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      const updatedDoc = await updateOne(
        { _id: new ObjectId(req.params.userId) },
        {
          $pull: {
            journalCategories: {
              _id: new ObjectId(req.params.categoryId),
            },
          },
        }
      );

      if (!updatedDoc.matchedCount) {
        return res.json(userResponses.user_not_found());
      }

      if (!updatedDoc.modifiedCount) {
        return res.json(userResponses.could_not_update());
      }

      return res.json(genericResponses.success());
    } catch (error) {
      res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
