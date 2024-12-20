import { Request, Response } from "express";
import { GridFSBucket, ObjectId } from "mongodb";
import { getClient } from "@/db";

import { Router, NextFunction } from "express";
import { validationResult, param } from "express-validator";
import { getAvatarStream } from "@/utils";
const router = Router();
// Add validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const avatarGetValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),
];

// Get avatar route
router.get(
  "/:userId",
  avatarGetValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await getAvatarStream(req.params.userId);

      if (!result) {
        return res.status(404).json({ message: "No avatar found" });
      }

      res.set("Content-Type", result.contentType);
      result.stream.pipe(res);
    } catch (error) {
      console.error("Avatar retrieval error:", error);
      res.status(500).json({ message: "Error retrieving avatar" });
    }
  }
);

module.exports = router;
