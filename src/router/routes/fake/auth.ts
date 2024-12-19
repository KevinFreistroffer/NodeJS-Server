import { Router } from "express";
import { formatSessionCookie } from "@/utils";
import { sign } from "jsonwebtoken";

const router = Router();
const token = "fake-jwt-token";

router.post("/", (req, res) => {
  // const token = sign(
  //   { data: UNSAFE_DOC._id.toString() },
  //   process.env.JWT_SECRET,
  //   {
  //     expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  //   }
  // );
  // res.set(formatSessionCookie(token));
  // Simulate successful auth
  res.json({
    success: true,
  });
});

module.exports = router;
