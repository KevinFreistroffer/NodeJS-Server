"use strict";

import * as express from "express";
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
        return res
          .status(statusCodes.missing_parameters)
          .json(genericResponses.missing_body_fields());
      }

      const updatedDoc = await updateOne(
        { _id: new ObjectId(req.params.userId) },
        {
          $pull: {
            entryCategories: {
              _id: new ObjectId(req.params.categoryId),
            },
          },
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
