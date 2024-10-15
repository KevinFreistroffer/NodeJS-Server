"use strict";

import * as express from "express";
import { Client, auth } from "twitter-api-sdk";
import dotenv from "dotenv";
import { generatePKCE } from "../../../utils";

dotenv.config();
const URL = (process.env.URL as string) || "http://127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI = `${URL}:${PORT}/x/callback`;

// const authClient = new auth.OAuth2User({
//   client_id: process.env.CLIENT_ID as string,
//   client_secret: process.env.CLIENT_SECRET as string,
//   callback: `${URL}:${PORT}/x/callback`,
//   scopes: ["tweet.read", "tweet.write", "users.read"],
// });
// const client = new Client(authClient);

const STATE = "california";
let pkceVerifier;
router.get("/auth", (req, res) => {
  const { verifier, challenge } = generatePKCE();
  pkceVerifier = verifier;

  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=tweet.write&state=state&code_challenge=${challenge}&code_challenge_method=S256`;
  res.redirect(authUrl);
});

module.exports = router;
