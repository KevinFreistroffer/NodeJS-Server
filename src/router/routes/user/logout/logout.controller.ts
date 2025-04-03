import { Request, Response } from "express";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class LogoutController {
  static async logout(req: Request, res: Response<IResponse>) {
    // Clear the session cookie
    res.clearCookie("session");

    return res.status(statusCodes.success).json(genericResponses.success());
  }
} 