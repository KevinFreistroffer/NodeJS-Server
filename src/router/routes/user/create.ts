"use strict";

import * as express from "express";
import { User } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import {
  responses as userResponses,
  statusCodes,
} from "../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../defs/responses/generic";
import {
  convertDocToSafeUser,
  handleCaughtErrorResponse,
} from "../../../utils";
import * as bcrypt from "bcryptjs";
import {
  findOneByUsernameOrEmail,
  findOneById,
  insertOne,
} from "../../../operations/user_operations";
import { sendAccountActivationEmail, hashPassword } from "../../../utils";
import { ObjectId } from "mongodb";
import multer from "multer";
import { GridFSBucket } from "mongodb";
import { getClient } from "../../../db";
import { IUser } from "@/defs/interfaces";
const router = express.Router();

// Setup multer storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// List of functionalities that can be unit tested:
// 1. Rate limiting functionality
// 2. Input validation (username, email, password)
// 3. Checking if username or email already exists
// 4. User creation process
// 5. Error handling for various scenarios
// 6. Response format and content for different outcomes
// 7. Conversion of user document to safe user object
// 8. Integration with user operations (findOneByUsernameOrEmail, insertOne, findOneById)
// 9. Proper use of status codes
// 10. Escaping of input fields

router.post(
  "/",
  upload.single("avatar"), // Add multer middleware
  body(["username", "password"]).notEmpty().bail().isString().bail().escape(),
  body("email").notEmpty().bail().isEmail().bail().escape(),
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { username, email, password } = req.body;
      const doc = await findOneByUsernameOrEmail(username, email);

      console.log(doc);

      if (doc) {
        console.log("Returning username or email registered");
        return res
          .status(statusCodes.username_or_email_already_registered)
          .json(userResponses.username_or_email_already_registered());
      }

      console.log("after returning");

      const encryptedPassword = await hashPassword(password);

      let avatarId: string | undefined;

      // Handle avatar file upload if present
      if (req.file) {
        const db = await getClient();
        const bucket = new GridFSBucket(db.db());

        avatarId = new ObjectId().toString();

        const uploadStream = bucket.openUploadStream(avatarId, {
          contentType: req.file.mimetype,
        });

        uploadStream.write(req.file.buffer);
        uploadStream.end();

        await new Promise((resolve, reject) => {
          uploadStream.on("finish", resolve);
          uploadStream.on("error", reject);
        });
      }

      const newUser: IUser = {
        username,
        usernameNormalized: username.toLowerCase(),
        email,
        emailNormalized: email.toLowerCase(),
        password: encryptedPassword,
        resetPasswordToken: "",
        resetPasswordTokenExpires: null,
        resetPasswordAttempts: [],
        journals: [],
        journalCategories: [
          {
            _id: new ObjectId(),
            category: "My Journals",
            selected: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        hasAcknowledgedHelperText: false,
        // avatar: req.file ? req.file.originalname : undefined,
        // avatarId: avatarId ? new ObjectId(avatarId) : undefined,
        avatar: undefined,
        avatarId: undefined,
        reminders: [
          // {
          //   _id: new ObjectId(),
          //   customFrequency: 1,
          //   customUnit: "day",
          //   date: "2022-01-01",
          //   description: "This is a reminder",
          //   endDate: "2022-12-31",
          //   ends: "after",
          //   occurrences: 10,
          //   recurrenceType: "daily",
          //   recurring: true,
          //   repeatOn: ["monday", "tuesday"],
          //   time: "08:00",
          //   title: "Test Reminder",
          // },
        ],
      };

      const insertDoc = await insertOne(newUser);

      if (!insertDoc || !insertDoc.insertedId) {
        console.log("inserting DOC. SHOULD BE HERE.");
        return res
          .status(statusCodes.error_inserting_user)
          .json(userResponses.error_inserting_user());
      }

      const userDoc = await findOneById(insertDoc.insertedId);

      if (!userDoc) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      console.log("SENDING ACTIVATION EMAIL");
      await sendAccountActivationEmail(email, userDoc._id.toString());

      return res.json(userResponses.success(convertDocToSafeUser(userDoc)));
    } catch (error) {
      console.log("error", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
