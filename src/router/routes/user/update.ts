import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import multer from "multer";
import { GridFSBucket } from "mongodb";
import { statusCodes } from "../../../defs/responses/status_codes";
import { responses as genericResponses } from "../../../defs/responses/generic";
import { findOneById, updateOne } from "../../../operations/user_operations";
import { handleCaughtErrorResponse } from "../../../utils";
import { responses as userResponses } from "../../../defs/responses/user";
import { getClient } from "../../../db";
import { IReminder } from "../../../defs/interfaces";
const router = Router();

// Set up multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// GridFS bucket setup

router.post(
  "/",
  upload.single("avatar"), // Handle file upload
  body("userId").isMongoId().withMessage("Invalid userId format"),
  body("hasAcknowledgedHelperText")
    .optional()
    .isBoolean()
    .withMessage("hasAcknowledgedHelperText must be a boolean"),
  body().custom((value, { req }) => {
    if (req.body.reminders) {
      if (!Array.isArray(req.body.reminders)) {
        throw new Error("reminders must be an array");
      }

      if (
        !req.body.reminders.every((reminder: IReminder) => {
          return (
            typeof reminder._id === "string" &&
            typeof reminder.title === "string" &&
            typeof reminder.date === "string" &&
            typeof reminder.time === "string"
          );
        })
      ) {
        throw new Error("reminders must be an array of IReminder");
      }
    }
    return false;
  }),
  async (req: Request, res: Response) => {
    try {
      let gfs: GridFSBucket;
      const client = getClient();
      const db = client.db(process.env.DATABASE_NAME);
      gfs = new GridFSBucket(db, {
        bucketName: "avatars",
      });

      console.log("/user/update", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, hasAcknowledgedHelperText } = req.body;

      const doc = await findOneById(userId);
      if (!doc) {
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found());
      }

      const updateFields: { [key: string]: any } = {};

      // hasAcknowledgedHelperText
      if (hasAcknowledgedHelperText !== undefined) {
        updateFields.hasAcknowledgedHelperText = hasAcknowledgedHelperText;
      }

      // reminders
      if (req.body.reminders) {
        updateFields.reminders = req.body.reminders;
      }

      // Handle avatar upload
      if (req.file) {
        // Delete old avatar if exists
        if (doc.avatarId) {
          await gfs.delete(new ObjectId(doc.avatarId));
        }

        // Upload new avatar
        const uploadStream = gfs.openUploadStream(req.file.originalname, {
          contentType: req.file.mimetype,
        });
        await new Promise<void>((resolve, reject) => {
          uploadStream.on("error", reject);
          uploadStream.on("finish", resolve);
          uploadStream.end(req.file!.buffer);
        });

        updateFields.avatarId = uploadStream.id.toString();
      }

      const updateResult = await updateOne(
        { _id: doc._id },
        { $set: updateFields }
      );

      console.log("updateResult", updateResult);

      if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
        return res.json(userResponses.could_not_update());
      }

      return res.json(genericResponses.success());
    } catch (error) {
      console.log(error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
