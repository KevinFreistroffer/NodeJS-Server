import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class CategoryController {
  static async delete(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, categoryId } = req.body;
    const returnUser = req.query.returnUser === "true";

    const doc = await updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          journalCategories: {
            _id: new ObjectId(categoryId)
          }
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
        .json(userResponses.could_not_update("Category not found or could not be deleted."));
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