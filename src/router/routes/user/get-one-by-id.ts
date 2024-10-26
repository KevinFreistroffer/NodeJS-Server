"use strict";

import * as express from "express";
import { handleCaughtErrorResponse } from "../../../utils";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic";
import { findOneById } from "../../../operations/user_operations";
import { ObjectId } from "mongodb";
import { statusCodes } from "../../../defs/responses/status_codes";
const router = express.Router();

router.get(
  "/:id",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      console.log("/get-one-by-id", req.params.id);
      if (!req.params.id || !ObjectId.isValid(req.params.id)) {
        console.log("invalid id");
        return res
          .status(statusCodes.missing_parameters)
          .json(genericResponses.missing_parameters());
      }

      console.log("valid id");

      const doc = await findOneById(new ObjectId(req.params.id));
      console.log("doc", doc);
      if (!doc) {
        console.log("doc not found");
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found());
      }

      console.log("doc found");

      return res.json(genericResponses.success(doc));
    } catch (error) {
      console.log("error", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
