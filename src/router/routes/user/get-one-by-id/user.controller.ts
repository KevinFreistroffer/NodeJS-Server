import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { findOneById } from "@/operations/user_operations";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { getAvatarStream, streamToDataURL } from "@/utils";

export class UserController {
  static async getOneById(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
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
  }
} 