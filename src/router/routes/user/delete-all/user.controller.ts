import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { deleteMany } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class UserController {
  static async deleteAll(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const returnUsers = req.query.returnUsers === "true";

    const result = await deleteMany({});
    if (!result.acknowledged) {
      return res
        .status(statusCodes.could_not_delete)
        .json(userResponses.could_not_delete("Users could not be deleted."));
    }

    if (returnUsers) {
      return res.status(statusCodes.success).json(genericResponses.success(result.deletedCount));
    }

    return res.status(statusCodes.success).json(genericResponses.success());
  }
} 