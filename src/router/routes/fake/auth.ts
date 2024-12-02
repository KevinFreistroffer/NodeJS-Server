import { Router } from "express";
import { formatSessionCookie } from "@/utils";

const router = Router();
const token = "fake-jwt-token";

router.post("/", (req, res) => {
  console.log("/fake/auth");
  console.log("Request cookies:", req.cookies);
  res.set(formatSessionCookie(token));
  // Simulate successful auth
  res.json({
    success: true,
  });
});

module.exports = router;
