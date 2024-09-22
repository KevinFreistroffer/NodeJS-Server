import { Router } from "express";
import { verifyJWT } from "../../../utils";
import { findOneById, updateOne } from "../../../operations/user_operations";
import { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { responses } from "../../../defs/responses/generic_responses";
const router = Router();

router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = verifyJWT(token);
    console.log("decoded", decoded);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      // Find the user by the decoded user ID
      const user = await findOneById(
        ObjectId.createFromHexString(decoded.userId)
      );

      console.log("user", user);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Account already verified" });
      }

      // Activate the user's account
      user.isVerified = true;
      const updateResult = await updateOne(
        { _id: user._id },
        { $set: { isVerified: true } }
      );

      console.log("updateResult", updateResult);

      if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
        return res.status(400).json({ message: "Failed to verify account" });
      } else {
        res.json(responses.success());
      }

      // Redirect to a success page or send a success response
      res.redirect("/account-verified"); // Or use res.json() for API response
    }

    console.log("decoded", decoded);

    return res
      .status(400)
      .json({ message: "Invalid or expired verification token" });
  } catch (error) {
    console.error("Account verification error:", error);
    res.status(400).json({ message: "Invalid or expired verification token" });
  }
});

module.exports = router;
