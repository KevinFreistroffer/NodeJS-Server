import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { updateOne, findOneById, findOneByEmail, findOneByUsername } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class UserController {
  static async update(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, username, email, firstName, lastName } = req.body;
    const returnUser = req.query.returnUser === "true";

    // Check if user exists
    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    // Check for unique constraints if updating username or email
    if (username && username !== user.username) {
      const existingUsername = await findOneByUsername(username);
      if (existingUsername) {
        return res
          .status(statusCodes.username_or_email_already_registered)
          .json(userResponses.username_or_email_already_registered("Username already exists."));
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await findOneByEmail(email);
      if (existingEmail) {
        return res
          .status(statusCodes.username_or_email_already_registered)
          .json(userResponses.username_or_email_already_registered("Email already exists."));
      }
    }

    // Prepare update fields
    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (username) {
      updateFields.username = username;
      // updateFields.usernameNormalized = username.toLowerCase();
    }

    if (email) {
      updateFields.email = email;
      // updateFields.emailNormalized = email.toLowerCase();
    }

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;

    // Update user
    const doc = await updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (!doc.matchedCount || doc.modifiedCount === 0) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("User could not be updated."));
    }

    if (returnUser) {
      const updatedUser = await findOneById(new ObjectId(userId));
      if (!updatedUser) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found("User not found."));
      }
      return res.status(statusCodes.success).json(genericResponses.success(updatedUser));
    }

    return res.status(statusCodes.success).json(genericResponses.success());
  }
} 