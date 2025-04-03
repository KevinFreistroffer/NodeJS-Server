import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { findAllJournals, findOneById } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class JournalsController {
  static async getAll(req: Request, res: Response<IResponse>, next: NextFunction) {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { userId } = req.body;
      const returnUser = req.query.returnUser === "true";

      const journals = await findAllJournals(new ObjectId(userId));
      if (!journals) {
        return res
          .status(statusCodes.resource_not_found)
          .json(userResponses.resource_not_found("No journals found for this user."));
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

      return res.status(statusCodes.success).json(genericResponses.success(journals));
    } catch (error) {
      next(error);
    }
  }
} 