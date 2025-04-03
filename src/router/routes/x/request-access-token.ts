"use strict";

import * as express from "express";
import { Client, auth } from "twitter-api-sdk";
import dotenv from "dotenv";
import { handleCaughtErrorResponse, asyncRouteHandler } from "../../../utils";
dotenv.config();
const URL = (process.env.URL as string) || "http://127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const router = express.Router();

const authClient = new auth.OAuth2User({
  client_id: process.env.X_CLIENT_ID as string,
  client_secret: process.env.X_CLIENT_SECRET as string,
  callback: `${URL}:${PORT}/x/callback`,
  scopes: ["tweet.read", "tweet.write", "users.read"],
});
const client = new Client(authClient);

const STATE = "california";

router.get("/", asyncRouteHandler(async (req: express.Request, res: express.Response) => {
  const response = await authClient.requestAccessToken(
    "AAAAAAAAAAAAAAAAAAAAAEdcwQEAAAAAdZGJuF%2Biy%2BBZrgEw3FVNwLw1nYM%3DRzJKK3xucYObrnOgC4D0EVQ2XtoDSWGS6oRq2xLi2BGf0RPvCm"
  );
  res.send(response);
}));

module.exports = router;
