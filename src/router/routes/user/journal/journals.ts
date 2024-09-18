import * as express from "express";
import { UserProjection } from "../../../../defs/models/user.model";
import { IJournal } from "../../../../defs/interfaces";
import { usersCollection } from "../../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../../middleware";
import { responses as userResponses } from "../../../../defs/responses/user";
import { findOneById } from "../../../../operations/user_operations";
import {
  responses as genericResponses,
  IResponse,
} from "../../../../defs/responses/generic_responses";
import { logUncaughtException } from "../../../../utils";
const router = express.Router();

router.get(
  "/:userId",
  async (
    req: express.Request<{ userId: string }>,
    res: express.Response<IResponse>
  ) => {
    try {
      if (
        !req.params.userId ||
        req.params.userId === "" ||
        !ObjectId.isValid(req.params.userId)
      ) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      const doc = await findOneById(new ObjectId(req.params.userId));

      if (!doc) {
        return res.status(404).json(userResponses.user_not_found());
      }
      res.status(200).json(genericResponses.success(doc.journals));
    } catch (error) {
      res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
