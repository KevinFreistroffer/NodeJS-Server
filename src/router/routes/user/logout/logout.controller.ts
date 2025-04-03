import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class LogoutController {
  static async logout(req: Request, res: Response<IResponse>, next: NextFunction) {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      res.clearCookie("session");
      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      next(error);
    }
  }
} 