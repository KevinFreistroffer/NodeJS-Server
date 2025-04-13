import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { findOneByEmail } from "@/db/operations/user_operations";
import { responses as userResponses, IEmailAvailableResponse } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class EmailController {
  static async checkAvailability(req: Request, res: Response<IEmailAvailableResponse | IResponse>) {
    const validatedErrors = validationResult(req).array();
    if (validatedErrors.length) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const email = req.body.email;
    const doc = await findOneByEmail(email);

    return res
      .status(statusCodes.success)
      .json(userResponses.email_available(!doc));
  }
} 