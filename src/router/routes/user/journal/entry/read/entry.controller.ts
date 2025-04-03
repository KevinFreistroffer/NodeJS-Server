import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { findOneById } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class EntryController {
  static async read(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, entryId } = req.body;
    const returnUser = req.query.returnUser === "true";

    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    if (entryId) {
      const entry = user.journals.find(
        (journal) => journal._id.toString() === entryId
      );

      if (!entry) {
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found("Journal entry not found."));
      }

      if (returnUser) {
        return res.status(statusCodes.success).json(genericResponses.success(user));
      }

      return res.status(statusCodes.success).json(genericResponses.success(entry));
    }

    if (returnUser) {
      return res.status(statusCodes.success).json(genericResponses.success(user));
    }

    return res.status(statusCodes.success).json(genericResponses.success(user.journals));
  }
} 