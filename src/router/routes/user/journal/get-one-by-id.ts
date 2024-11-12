import * as express from "express";
import { ObjectId } from "mongodb";
import { responses as userResponses } from "@/defs/responses/user";
import { findOne, findOneById } from "@/operations/user_operations";
import {
  responses as genericResponses,
  IResponse,
} from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { handleCaughtErrorResponse } from "@/utils";
const router = express.Router();

router.get(
  "/:userId/:journalId",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      if (
        !req.params.userId ||
        req.params.userId === "" ||
        !ObjectId.isValid(req.params.userId) ||
        !req.params.journalId ||
        req.params.journalId === "" ||
        !ObjectId.isValid(req.params.journalId)
      ) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const doc = await findOne({
        query: {
          _id: new ObjectId(req.params.id),
          journals: {
            $elemMatch: { _id: new ObjectId(req.params.journalId) },
          },
        },
        sanitize: true,
      });

      if (!doc) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      return res
        .status(statusCodes.success)
        .json(genericResponses.success(doc.journals));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
