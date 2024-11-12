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

const router = Router();
dotenv.config();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

// Update validation middleware
const avatarUploadValidation = [
  body("userId").isMongoId().withMessage("Invalid user ID format"),
  body("avatar")
    .isString()
    .notEmpty()
    .withMessage("Avatar string is required")
    .custom((value) => {
      // Optional: Add additional validation for the string format if needed
      // For example, checking if it's a valid base64 string
      try {
        Buffer.from(value, "base64");
        return true;
      } catch (error) {
        throw new Error("Invalid avatar string format");
      }
    }),
];

// Add validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  console.log("avatar upload validateRequest errors", errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Upload avatar route
router.post(
  "/",
  async (req: Request, res: Response) => {
    console.log("/upload uploading avatar");
    try {
      const userId = req.body.userId;
      const avatarString = req.body.avatar;
      const bucket = ObjectId.createFromHexString(userId);

      // Detect image type from base64 string
      const imageType = avatarString.match(/^data:image\/(\w+);base64,/)?.[1] || 'png';

      // Remove base64 header if present
      const cleanAvatarString = avatarString.replace(/^data:image\/\w+;base64,/, '');

      // Convert clean string to buffer
      const buffer = Buffer.from(cleanAvatarString, "base64");

      const client = await getClient();
      await client.connect();
      const db = client.db(process.env.DATABASE_NAME);
      const avatarBucket = new GridFSBucket(db, {
        bucketName: "avatars",
      });

      // Delete old avatar if exists
      const oldAvatar = await avatarBucket
        .find({ "metadata.userId": bucket })
        .toArray();
      console.log("oldAvatar", oldAvatar);
      if (oldAvatar.length > 0) {
        await avatarBucket.delete(oldAvatar[0]._id);
      }

      // Create readable stream from buffer
      const readStream = new Readable();
      readStream.push(buffer);
      readStream.push(null);

      // Create upload stream with dynamic image type
      const uploadStream = avatarBucket.openUploadStream(
        `avatar-${bucket.toString()}-${Date.now()}.${imageType}`,
        {
          contentType: `image/${imageType}`,
          metadata: { userId: bucket },
        }
      );

      // Handle upload completion
      await new Promise((resolve, reject) => {
        readStream.pipe(uploadStream).on("finish", resolve).on("error", reject);
      });

      console.log("uploadStream.id", uploadStream.id, typeof uploadStream.id);

      // Update user's avatarId in the database
      const updateResult = await updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        { $set: { avatarId: uploadStream.id } }
      );

      console.log("updateResult", updateResult);

      // Check if update was successful
      if (!updateResult.matchedCount || !updateResult.modifiedCount) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update());
      }

      return res.json({
        message: "Avatar uploaded successfully",
        fileId: uploadStream.id,
        filename: uploadStream.filename,
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: "Error uploading avatar" });
    }
  }
);

module.exports = router;
