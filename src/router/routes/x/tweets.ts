"use strict";

import * as express from "express";
import { Client, auth } from "twitter-api-sdk";
import dotenv from "dotenv";
import { handleCaughtErrorResponse } from "../../../utils";
dotenv.config();
const URL = (process.env.URL as string) || "http://127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const router = express.Router();

const authClient = new auth.OAuth2User({
  client_id: process.env.CLIENT_ID as string,
  client_secret: process.env.CLIENT_SECRET as string,
  callback: `${URL}:${PORT}/x/callback`,
  scopes: ["tweet.read", "tweet.write", "users.read"],
});
const client = new Client(authClient);

const STATE = "california";

router.get("/", async function (req, res) {
  try {
    const response = await client.tweets.createTweet({
      text: "hjkjkhjkhjkh",
    });

    res.send(response);
  } catch (error) {}
});

module.exports = router;
