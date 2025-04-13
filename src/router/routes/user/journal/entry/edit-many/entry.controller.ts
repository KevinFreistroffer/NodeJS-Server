import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { IJournal } from "@/defs/interfaces";

export class EntryController {
  static async editMany(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, entries } = req.body;
    const returnUser = req.query.returnUser === "true";

    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    const updatedJournals = user.journals.map((journal) => {
      const updateEntry = entries.find(
        (entry: IJournal) => entry.entryId === journal._id.toString()
      );

      if (!updateEntry) return journal;

      return {
        ...journal,
        title: updateEntry.title ?? journal.title,
        entry: updateEntry.entry ?? journal.entry,
        categories: updateEntry.categories ?? journal.categories,
        favorite: updateEntry.favorite ?? journal.favorite,
        sentimentScore: updateEntry.sentimentScore ?? journal.sentimentScore,
      };
    });

    const doc = await updateOne(
      { _id: new ObjectId(userId) },
      { $set: { journals: updatedJournals } }
    );

    if (!doc.matchedCount) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    if (doc.modifiedCount === 0) {
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