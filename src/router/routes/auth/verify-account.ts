import { Router } from "express";

const router = Router();

router.get("/verify-account/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = verifyToken(token);

    // Find the user by the decoded user ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Activate the user's account
    user.isVerified = true;
    await user.save();

    // Redirect to a success page or send a success response
    res.redirect("/account-verified"); // Or use res.json() for API response
  } catch (error) {
    console.error("Account verification error:", error);
    res.status(400).json({ message: "Invalid or expired verification token" });
  }
});

export default router;
