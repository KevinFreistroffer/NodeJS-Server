import * as express from "express";
import { Router } from "express";
import { asyncRouteHandler, formatSessionCookie } from "@/utils";
import { sign } from "jsonwebtoken";
import { IResponse, responses } from "@/defs/responses/generic";

const router = Router();
const token = "fake-jwt-token";

router.post("/", asyncRouteHandler(async (req: express.Request, res: express.Response<IResponse>) => {
  // const token = sign(
  //   { data: UNSAFE_DOC._id.toString() },
  //   process.env.JWT_SECRET,
  //   {
  //     expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  //   }
  // );
  // res.set(formatSessionCookie(token));
  // Simulate successful auth
  res.json(responses.success());
}));

module.exports = router;
