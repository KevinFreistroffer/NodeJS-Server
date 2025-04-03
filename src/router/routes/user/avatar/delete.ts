import { Router, Request, Response, NextFunction } from "express";
import { MongoClient, ObjectId, GridFSBucket } from "mongodb";
import { Readable } from "stream";
import dotenv from "dotenv";
import multer from "multer";
import { getClient } from "@/db";
import { body, param, validationResult } from "express-validator";
import { updateOne } from "@/operations/user_operations";
import { statusCodes } from "@/defs/responses/status_codes";
import { responses as userResponses } from "@/defs/responses/user";
import { asyncRouteHandler } from "@/utils";

const router = Router();
dotenv.config();

// Remove validation middleware
const avatarRemoveValidation = [
  body("userId").isMongoId().withMessage("Invalid user ID format"),
];

// Validate request middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Remove avatar route
router.delete("/", avatarRemoveValidation, validateRequest, asyncRouteHandler(async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const bucket = ObjectId.createFromHexString(userId);

  const client = await getClient();
  await client.connect();
  const db = client.db(process.env.DATABASE_NAME);
  const avatarBucket = new GridFSBucket(db, {
    bucketName: "avatars",
  });

  // Find and delete the avatar
  const oldAvatar = await avatarBucket
    .find({ "metadata.userId": bucket })
    .toArray();

  if (oldAvatar.length === 0) {
    return res.status(404).json({ message: "No avatar found for this user" });
  }

  // Delete the avatar file
  await avatarBucket.delete(oldAvatar[0]._id);

  // Update user's avatarId to null in the database
  const updateResult = await updateOne(
    { _id: ObjectId.createFromHexString(userId) },
    { $set: { avatarId: null } }
  );

  // Check if update was successful
  if (!updateResult.matchedCount || !updateResult.modifiedCount) {
    return res
      .status(statusCodes.could_not_update)
      .json(userResponses.could_not_update());
  }

  return res.json({
    message: "Avatar removed successfully"
  });

})
);

module.exports = router;
