"use strict";

import * as express from "express";
import {
  handleCaughtErrorResponse,
  getAvatarStream,
  streamToDataURL,
} from "@/utils";
import {
  IResponse,
  responses as genericResponses,
} from "@/defs/responses/generic";
import { findOneById } from "@/operations/user_operations";
import { ObjectId } from "mongodb";
import { statusCodes } from "@/defs/responses/status_codes";
const router = express.Router();

router.get(
  "/:id",
  async (req: express.Request, res: express.Response<IResponse>) => {
    console.log("GET ONE BY ID GET()()()()()");
    try {
      if (!req.params.id || !ObjectId.isValid(req.params.id)) {
        return res
          .status(statusCodes.missing_parameters)
          .json(genericResponses.missing_parameters());
      }

      const doc = await findOneById(new ObjectId(req.params.id));

      if (!doc) {
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found());
      }

      const avatarStream = await getAvatarStream(doc._id.toString());

      // Add avatar data if available
      if (avatarStream) {
        doc.avatar = {
          _id: doc._id,
          data: await streamToDataURL(
            avatarStream.stream,
            avatarStream.contentType || ""
          ),
          contentType: avatarStream.contentType || "",
        };
      }

      return res.json(genericResponses.success(doc));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
