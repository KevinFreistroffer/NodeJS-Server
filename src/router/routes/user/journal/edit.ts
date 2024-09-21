"use strict";

import * as express from "express";
import { IJournal, IJournalDoc, IUser } from "../../../../defs/interfaces";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { usersCollection } from "../../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../../middleware";
import { findOneById, updateOne } from "../../../../operations/user_operations";
import {
  responses as userResponses,
  IResponses,
} from "../../../../defs/responses/user";
import { logUncaughtExceptionAndReturn500Response } from "../../../../utils";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic";

interface IRequestBody {
  userId: string;
  journalId: string;
  title: string | undefined;
  entry: string | undefined;
  category: string | undefined;
}

const router = express.Router();
const validatedIds = body(["userId", "journalId"]) // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();
const validatedFields = body(["title", "entry", "category"])
  .optional()
  .isString()
  .escape();

// TODO validate title entry category

router.post(
  "/",
  validatedIds,
  validatedFields,
  async (
    req: express.Request<any, any, IRequestBody>,

    res: express.Response<IResponse>
  ) => {
    try {
      const errors = validationResult(req);
      if (
        !errors.isEmpty() ||
        (!has(req.body, "title") &&
          !has(req.body, "entry") &&
          !has(req.body, "category"))
      ) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      const { userId, journalId, title, entry, category } = req.body;
      const query: {
        ["journals.$.title"]?: string;
        ["journals.$.entry"]?: string;
        ["journals.$.category"]?: string;
      } = {};

      if (title) {
        query["journals.$.title"] = title;
      }

      if (entry) {
        query["journals.$.entry"] = entry;
      }

      if (category) {
        query["journals.$.category"] = category;
      }

      const doc = await updateOne(
        {
          _id: new ObjectId(userId),
          "journals._id": new ObjectId(journalId),
        },
        {
          $set: query,
        }
        //{ new: true } // What is this?????
      );

      if (!doc.matchedCount) {
        return res.status(404).json(userResponses.user_not_found());
      }

      if (!doc.modifiedCount) {
        return res.json(userResponses.could_not_update());
      }

      const userDoc = await findOneById(new ObjectId(userId));

      if (!userDoc) {
        res.json(
          userResponses.user_not_found("Could not find the updated server.")
        );
      }

      return res.send(genericResponses.success(userDoc));
    } catch (error) {
      return res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
