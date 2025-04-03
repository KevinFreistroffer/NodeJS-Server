import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { findOneByUsername } from "@/operations/user_operations";
import { responses as userResponses, IUsernameAvailableResponse } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class UsernameController {
  static async checkAvailability(req: Request, res: Response<IUsernameAvailableResponse | IResponse>) {
    const validatedErrors = validationResult(req).array();
    if (validatedErrors.length) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const doc = await findOneByUsername(req.body.username);
    const isAvailable = !doc;

    return res
      .status(statusCodes.success)
      .json(userResponses.username_available(isAvailable));
  }
} 