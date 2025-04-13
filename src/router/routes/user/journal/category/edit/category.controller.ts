import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class CategoryController {
  static async edit(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, categoryId, category } = req.body;
    const returnUser = req.query.returnUser === "true";

    const doc = await updateOne(
      {
        _id: new ObjectId(userId),
        "journalCategories._id": new ObjectId(categoryId)
      },
      {
        $set: {
          "journalCategories.$.category": category
        }
      }
    );

    if (!doc.matchedCount) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User or category not found."));
    }

    if (doc.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("User not updated."));
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