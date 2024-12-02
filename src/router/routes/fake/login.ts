import { Router } from "express";
import { formatSessionCookie } from "@/utils";

const router = Router();
const token = "fake-jwt-token";

router.post("/", (req, res) => {
  console.log("/fake/login");
  console.log("Request cookies:", req.cookies);
  res.set(formatSessionCookie(token));
  // Simulate successful login
  res.status(200).json({
    success: true,
    user: {
      id: 1,
      username: "test_user",
      email: "test@example.com",
    },
  });
});

module.exports = router;
