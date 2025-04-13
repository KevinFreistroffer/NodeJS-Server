import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { IReminder } from "@/defs/interfaces";

export class RemindersController {
  static async create(req: Request, res: Response<IResponse>, next: NextFunction) {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { userId, title, description, dueDate, priority, completed } = req.body;
      const returnUser = req.query.returnUser === "true";

      const newReminder: IReminder = {
        _id: new ObjectId(),
        title,
        description,
        date: dueDate,
        time: new Date(dueDate).toISOString().split('T')[1],
        recurring: false,
        recurrenceType: "none",
        customFrequency: 0,
        customUnit: "days",
        repeatOn: [],
        endDate: dueDate,
        ends: "never",
        occurrences: 0
      };

      const doc = await updateOne(
        { _id: new ObjectId(userId) },
        {
          $addToSet: {
            reminders: newReminder as any
          }
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
          .json(userResponses.could_not_update("Could not add reminder."));
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

      // TODO: Remove this as any
      return res.status(statusCodes.success).json(genericResponses.success(newReminder as any));
    } catch (error) {
      next(error);
    }
  }
} 