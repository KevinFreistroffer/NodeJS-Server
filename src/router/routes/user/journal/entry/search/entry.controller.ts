import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { ICategory } from "@/defs/interfaces";
export class EntryController {
  static async search(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, searchTerm, startDate, endDate, categories, favorite, sentimentRange } = req.body;
    const returnUser = req.query.returnUser === "true";

    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    let filteredJournals = user.journals.filter((journal) => {
      // Search term filter
      const matchesSearchTerm =
        journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.entry.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filter
      const journalDate = new Date(journal.createdAt);
      const matchesDateRange =
        (!startDate || journalDate >= new Date(startDate)) &&
        (!endDate || journalDate <= new Date(endDate));

      // Categories filter
      const matchesCategories =
        !categories ||
        categories.length === 0 ||
        journal.categories.some((cat: ICategory) => categories.includes(cat._id.toString()));

      // Favorite filter
      const matchesFavorite =
        favorite === undefined || journal.favorite === favorite;

      // Sentiment range filter
      const matchesSentiment =
        !sentimentRange ||
        (journal.sentimentScore >= sentimentRange.min &&
          journal.sentimentScore <= sentimentRange.max);

      return (
        matchesSearchTerm &&
        matchesDateRange &&
        matchesCategories &&
        matchesFavorite &&
        matchesSentiment
      );
    });

    if (returnUser) {
      return res.status(statusCodes.success).json(genericResponses.success(user));
    }

    return res.status(statusCodes.success).json(genericResponses.success(filteredJournals));
  }
} 