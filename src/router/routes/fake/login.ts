import { Router } from "express";
import { formatSessionCookie } from "@/utils";

const router = Router();
const token = "fake-jwt-token";

router.post("/", (req, res) => {
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
