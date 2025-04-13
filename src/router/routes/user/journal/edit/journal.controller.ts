import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { IJournal } from "@/defs/interfaces";

export class JournalController {
  static async edit(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, entryId, title, entry, categories, favorite, sentimentScore } = req.body;
    const returnUser = req.query.returnUser === "true";

    // Check if user exists
    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    // Check if journal exists
    const journal = user.journals.find(
      (j) => j._id.toString() === entryId
    );
    if (!journal) {
      return res
        .status(statusCodes.resource_not_found)
        .json(genericResponses.resource_not_found(`Journal entry with ID ${entryId} not found.`));
    }

    // Prepare update fields
    const updateFields: Partial<IJournal> = {};
    if (title !== undefined) updateFields.title = title;
    if (entry !== undefined) updateFields.entry = entry;
    if (categories !== undefined) updateFields.categories = categories;
    if (favorite !== undefined) updateFields.favorite = favorite;
    if (sentimentScore !== undefined) updateFields.sentimentScore = sentimentScore;
    updateFields.updatedAt = new Date();

    // Update the journal entry
    const result = await updateOne(
      {
        _id: new ObjectId(userId),
        "journals._id": new ObjectId(entryId)
      },
      {
        $set: {
          "journals.$.title": updateFields.title,
          "journals.$.entry": updateFields.entry,
          "journals.$.categories": updateFields.categories,
          "journals.$.favorite": updateFields.favorite,
          "journals.$.sentimentScore": updateFields.sentimentScore,
          "journals.$.updatedAt": updateFields.updatedAt
        }
      }
    );

    if (!result.matchedCount || result.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("Journal entry could not be updated."));
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