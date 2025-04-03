import * as express from "express";
import { Router } from "express";
import { asyncRouteHandler, formatSessionCookie } from "@/utils";
import { IResponse, responses } from "@/defs/responses/generic";

const router = Router();
const token = "fake-jwt-token";

router.post("/", asyncRouteHandler(async (req: express.Request, res: express.Response<IResponse>) => {
  res.set(formatSessionCookie(token));
  // Simulate successful login
  res.status(200).json(responses.success());
}));

module.exports = router;
