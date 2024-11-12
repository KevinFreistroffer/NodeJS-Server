import { Request, Response } from "express";
import { GridFSBucket, ObjectId } from "mongodb";
import { getClient } from "@/db";

import { Router, NextFunction } from "express";
import { validationResult, param } from "express-validator";
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
      const client = await getClient();
      await client.connect();
      const db = client.db(process.env.DATABASE_NAME);
      const bucket = new ObjectId(req.params.userId);
      const avatarBucket = new GridFSBucket(db, {
        bucketName: "avatars",
      });

      const files = await avatarBucket
        .find({ "metadata.userId": bucket })
        .toArray();

      if (!files.length) {
        return res.status(404).json({ message: "No avatar found" });
      }

      res.set("Content-Type", files[0].contentType);
      avatarBucket.openDownloadStream(files[0]._id).pipe(res);
    } catch (error) {
      console.error("Avatar retrieval error:", error);
      res.status(500).json({ message: "Error retrieving avatar" });
    }
  }
);

module.exports = router;
