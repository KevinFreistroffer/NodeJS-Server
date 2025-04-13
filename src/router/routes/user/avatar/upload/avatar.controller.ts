import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse, statusCodes } from "@/defs/responses/generic";
import { errorCodes } from "@/defs/responses/status_codes";

export class AvatarController {
  static async upload(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, data } = req.body;
    const returnUser = req.query.returnUser === "true";

    // Extract content type from base64 string
    const contentType = data.split(";")[0].split(":")[1];

    const doc = await updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          avatar: {
            _id: new ObjectId(),
            data,
            contentType,
          },
        },
      }
    );

    if (!doc.matchedCount) {
      return res
        .status(statusCodes.resource_not_found)
        .json(userResponses.resource_not_found("User not found."));
    }

    if (doc.modifiedCount === 0) {
      return res
        .status(statusCodes.something_went_wrong)
        .json(userResponses.could_not_update("Avatar not uploaded."));
    }

    if (returnUser) {
      const user = await findOneById(new ObjectId(userId));
      if (!user) {
        return res
          .status(statusCodes.resource_not_found)
          .json(userResponses.resource_not_found("User not found."));
      }
      return res.status(statusCodes.success).json(genericResponses.success(user));
    }

    return res.status(statusCodes.success).json(genericResponses.success());
  }
} 