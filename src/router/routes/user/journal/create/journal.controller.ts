import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { Journal } from "@/defs/models/journal.model";
import { updateOne, findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class JournalController {
  static async create(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, title, entry, categories, favorite, sentimentScore } = req.body;
    const returnUser = req.query.returnUser === "true";
    const selected = true
    // Create new journal entry
    const newJournal = new Journal(
      title,
      entry,
      categories || [],
      selected,
      favorite || false,
      sentimentScore
    );

    // Update user with new journal entry
    const doc = await updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          journals: {
            _id: new ObjectId(),
            ...newJournal,
          },
        },
      }
    );

    if (!doc.matchedCount) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    if (doc.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("Journal entry could not be created."));
    }

    if (returnUser) {
      const user = await findOneById(new ObjectId(userId));
      if (!user) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found("User not found."));
      }
      return res.status(statusCodes.success).json(genericResponses.success(user));
    }

    return res.status(statusCodes.success).json(genericResponses.success());
  }
} 