import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse, statusCodes } from "@/defs/responses/generic";
import { errorCodes } from "@/defs/responses/status_codes";

export class AvatarController {
  static async get(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId } = req.body;
    const returnUser = req.query.returnUser === "true";

    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.resource_not_found)
        .json(userResponses.resource_not_found("User not found."));
    }

    if (!user.avatar) {
      return res
        .status(statusCodes.resource_not_found)
        .json(userResponses.resource_not_found("Avatar not found."));
    }

    if (returnUser) {
      return res.status(statusCodes.success).json(genericResponses.success(user));
    }

    return res.status(statusCodes.success).json(genericResponses.success(user.avatar.data));
  }
} 