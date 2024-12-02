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
  body("name").optional().isString().withMessage("name must be a string"),
  body("bio").optional().isString().withMessage("bio must be a string"),
  body("company").optional().isString().withMessage("company must be a string"),
  body("location")
    .optional()
    .isString()
    .withMessage("location must be a string"),
  body("website").optional().isString().withMessage("website must be a string"),
  body("hasAcknowledgedHelperText")
    .optional()
    .isBoolean()
    .withMessage("hasAcknowledgedHelperText must be a boolean"),
  body("sex")
    .optional()
    .isIn(["male", "female", "non-binary"])
    .withMessage("sex must be either 'male', 'female', or 'non-binary'"),
  body().custom((value, { req }) => {
    console.log("valuez", value);
    if (value.reminders) {
      console.log("value.reminders TRUTHY");
      if (!Array.isArray(value.reminders)) {
        throw new Error("reminders must be an array");
      }

      if (
        !value.reminders.every((reminder: IReminder) => {
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
    console.log("returning true");
    return true;
  }),
  async (req: Request, res: Response) => {
    try {
      console.log("/user/update...", req.body);
      let gfs: GridFSBucket;
      const client = getClient();
      const db = client.db(process.env.DATABASE_NAME);
      gfs = new GridFSBucket(db, {
        bucketName: "avatars",
      });

      console.log("/user/update", req.body);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // @ts-ignore
        const errorFields = errors.array().map((error) => error);
        console.log("errorFields", errorFields);
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        userId,
        hasAcknowledgedHelperText,
        name,
        bio,
        company,
        location,
        website,
        sex,
      } = req.body;
      console.log("/UPDATE req.body", req.body.userId);
      const doc = await findOneById(new ObjectId(userId.toString()));
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
        if (doc.avatar) {
          await gfs.delete(new ObjectId(doc.avatar._id));
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

      if (name !== undefined) updateFields.name = name;
      if (bio !== undefined) updateFields.bio = bio;
      if (company !== undefined) updateFields.company = company;
      if (location !== undefined) updateFields.location = location;
      if (website !== undefined) updateFields.website = website;
      if (sex !== undefined) updateFields.sex = sex;
      console.log("updateFields", updateFields);
      const updateResult = await updateOne(
        { _id: doc._id },
        { $set: updateFields }
      );

      console.log("updateResult", updateResult);

      if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
        return res.json(userResponses.could_not_update());
      }

      // Fetch the updated user
      const updatedUser = await findOneById(doc._id);

      if (!updatedUser) {
        // Create a modified version of the original doc with the updated fields
        const modifiedUser = {
          ...doc,
          ...updateFields,
          _id: doc._id.toString(), // Ensure _id is in string format
        };

        return res.json({
          ...genericResponses.success(),
          user: modifiedUser,
        });
      }

      return res.json({
        ...genericResponses.success(),
        user: updatedUser,
      });
    } catch (error) {
      console.log(error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
