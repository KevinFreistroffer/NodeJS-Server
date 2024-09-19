"use strict";

import crypto from "node:crypto";
import dotenv from "dotenv";
import { Request, Response, Router } from "express";
import { sign } from "jsonwebtoken";
import {
  IResponse,
  responses,
  statusCodes,
} from "../../../defs/responses/generic";
import { EMessageType } from "../../../defs/enums";
import { ERROR_GENERATING_JWT } from "../../../defs/constants";

dotenv.config();

const router = Router();

router.get("/", (req: Request, res: Response<IResponse>) => {
  try {
    const accessKey = req.headers["access-key"];

    if (
      typeof accessKey === "undefined" ||
      Array.isArray(accessKey) ||
      accessKey !== process.env.API_ACCESS_KEY
    ) {
      return res.sendStatus(statusCodes.invalid_request);
    }

    const jwtToken = sign(
      { data: crypto.randomUUID() },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
      }
    );

    if (!jwtToken) {
      return res
        .status(statusCodes.something_went_wrong)
        .json(responses.something_went_wrong(ERROR_GENERATING_JWT));
    }

    return res.json(responses.success(jwtToken));
  } catch (error) {
    return res
      .status(statusCodes.caught_error)
      .json(responses.caught_error(error));
  }
});

module.exports = router;
