import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class JournalController {
  static async delete(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, journalId } = req.body;
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
      (j) => j._id.toString() === journalId
    );
    if (!journal) {
      return res
        .status(statusCodes.resource_not_found)
        .json(userResponses.resource_not_found("Journal entry not found."));
    }

    // Delete journal entry
    const doc = await updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          journals: {
            _id: new ObjectId(journalId),
          },
        },
      }
    );

    if (!doc.matchedCount || doc.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("Journal entry could not be deleted."));
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