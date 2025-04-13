import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { findOneById } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class CategoryController {
  static async read(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_parameters)
        .json(genericResponses.missing_parameters());
    }

    const userId = req.query.userId as string;
    const categoryId = req.query.categoryId as string | undefined;

    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    // If categoryId is provided, return only that category
    if (categoryId) {
      const category = user.journalCategories?.find(
        cat => cat._id.toString() === categoryId
      );

      if (!category) {
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found("Category not found."));
      }

      return res.status(statusCodes.success).json(genericResponses.success(user));
    }

    // If no categoryId is provided, return all categories
    return res.status(statusCodes.success).json(
      genericResponses.success(user)
    );
  }
} 