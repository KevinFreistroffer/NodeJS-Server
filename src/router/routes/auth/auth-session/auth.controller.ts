import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { responses, IResponse, statusCodes } from "@/defs/responses/generic";

export class AuthController {
  static async checkSession(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(responses.missing_body_fields());
    }

    // TODO: implement session check logic
    return res
      .status(statusCodes.access_denied)
      .json(responses.access_denied());
  }
} 