import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { IJournal } from "@/defs/interfaces";

interface IJournalEntry {
  entryId: string;
  title?: string;
  entry?: string;
  categories?: Array<{
    _id: string;
    category: string;
    selected: boolean;
  }>;
  favorite?: boolean;
  sentimentScore?: number;
}

export class JournalController {
  static async editMany(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, entries } = req.body;
    const returnUser = req.query.returnUser === "true";

    // Check if user exists
    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    // Check if all journals exist
    for (const entry of entries) {
      const journal = user.journals.find(
        (j) => j._id.toString() === entry.entryId
      );
      if (!journal) {
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found(`Journal entry with ID ${entry.entryId} not found.`));
      }
    }

    // Update each journal entry
    const updateOperations = entries.map((entry: IJournalEntry) => {
      const updateFields: Partial<IJournal> = {};
      if (entry.title !== undefined) updateFields.title = entry.title;
      if (entry.entry !== undefined) updateFields.entry = entry.entry;
      if (entry.categories !== undefined) updateFields.categories = entry.categories;
      if (entry.favorite !== undefined) updateFields.favorite = entry.favorite;
      if (entry.sentimentScore !== undefined) updateFields.sentimentScore = entry.sentimentScore;
      updateFields.updatedAt = new Date();

      return {
        updateOne: {
          filter: {
            _id: new ObjectId(userId),
            "journals._id": new ObjectId(entry.entryId)
          },
          update: {
            $set: {
              "journals.$.title": updateFields.title,
              "journals.$.entry": updateFields.entry,
              "journals.$.categories": updateFields.categories,
              "journals.$.favorite": updateFields.favorite,
              "journals.$.sentimentScore": updateFields.sentimentScore,
              "journals.$.updatedAt": updateFields.updatedAt
            }
          }
        }
      };
    });

    const result = await updateOne(
      { _id: new ObjectId(userId) },
      { $set: { journals: user.journals } }
    );

    if (!result.matchedCount || result.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("Journal entries could not be updated."));
    }

    if (returnUser) {
      const updatedUser = await findOneById(new ObjectId(userId));
      if (!updatedUser) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found("User not found."));
      }
      return res.status(statusCodes.success).json(genericResponses.success(updatedUser));
    }

    return res.status(statusCodes.success).json(genericResponses.success());
  }
} 