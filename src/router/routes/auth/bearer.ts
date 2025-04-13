"use strict";

import crypto from "node:crypto";
import dotenv from "dotenv";
import { Request, Response, Router } from "express";
import { sign } from "jsonwebtoken";
import {
  IResponse,
  responses,
  statusCodes,
} from "@/defs/responses/generic";
import { ERROR_GENERATING_JWT } from "@/defs/constants";
import { handleCaughtErrorResponse, asyncRouteHandler } from "@/utils";
dotenv.config();

const router = Router();

router.get("/", asyncRouteHandler(async (req: Request, res: Response<IResponse>) => {
  console.log("BEARER GET()()()()()");

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
    throw new Error(ERROR_GENERATING_JWT);
  }

  return res.json(responses.success(jwtToken));

}));

module.exports = router;
