"use strict";

import * as express from "express";
import { Client, auth } from "twitter-api-sdk";
import dotenv from "dotenv";
import { handleCaughtErrorResponse } from "../../../utils";
import axios from "axios";
dotenv.config();
const URL = (process.env.URL as string) || "http://127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const router = express.Router();
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI = `${URL}:${PORT}/x/callback`;
let pkceVerifier!: string;
const authClient = new auth.OAuth2User({
  client_id: process.env.CLIENT_ID as string,
  client_secret: process.env.CLIENT_SECRET as string,
  callback: `${URL}:${PORT}/x/callback`,
  scopes: ["tweet.read", "tweet.write", "users.read"],
});
const client = new Client(authClient);
const STATE = "california";

// Handle OAuth callback
router.get("/callback", async (req: express.Request, res: express.Response) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      null,
      {
        params: {
          code,
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          code_verifier: pkceVerifier,
        },
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET,
        },
      }
    );

    const { access_token } = tokenResponse.data;
    // In a real app, you'd store this token securely and associate it with the user's session
    res.send(
      `<script>localStorage.setItem('twitter_token', '${access_token}'); window.location.href = '/';</script>`
    );
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).send("Authentication failed");
  }
});

// router.get("/", async function (req, res) {
//   try {
//     const { code, state } = req.query;
//     if (state !== STATE) return res.status(500).send("State isn't matching");
//     await authClient.requestAccessToken(code as string);
//     res.redirect("/tweets");
//   } catch (error) {
//     return handleCaughtErrorResponse(error, req, res);
//   }
// });

module.exports = router;
