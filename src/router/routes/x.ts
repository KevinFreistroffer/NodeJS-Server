import * as express from "express";
import axios from "axios";
import crypto from "crypto";
const router = express.Router();
// Configure environment variables
const CLIENT_ID = "your_client_id";
const CLIENT_SECRET = "your_client_secret";
const REDIRECT_URI = "http://localhost:3000/callback";

// Generate PKCE challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

// Store PKCE verifier (in memory for this example, use a database in production)
let pkceVerifier: string;

// Initiate OAuth flow
router.get("/auth", (req, res) => {
  const { verifier, challenge } = generatePKCE();
  pkceVerifier = verifier;

  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=tweet.write&state=state&code_challenge=${challenge}&code_challenge_method=S256`;
  res.redirect(authUrl);
});

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

    const { access_token } = tokenResponse.data as { access_token: string };
    // In a real app, you'd store this token securely and associate it with the user's session
    res.send(
      `<script>localStorage.setItem('twitter_token', '${access_token}'); window.location.href = '/';</script>`
    );
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).send("Authentication failed");
  }
});

// API endpoint to post a tweet
router.post(
  "/api/tweet",
  async (req: express.Request, res: express.Response) => {
    const { text } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const response = await axios.post(
        "https://api.twitter.com/2/tweets",
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error("Error posting tweet:", error);
      res.status(500).json({ error: "Failed to post tweet" });
    }
  }
);

module.exports = router;
