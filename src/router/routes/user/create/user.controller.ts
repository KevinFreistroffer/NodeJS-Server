import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { insertOne, findOneByEmail, findOneByUsername } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";

export class UserController {
  static async create(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Check if username or email already exists
    const existingUsername = await findOneByUsername(username);
    if (existingUsername) {
      return res
        .status(statusCodes.resource_exists)
        .json(userResponses.resource_exists("Username already exists."));
    }

    const existingEmail = await findOneByEmail(email);
    if (existingEmail) {
      return res
        .status(statusCodes.resource_exists)
        .json(userResponses.resource_exists("Email already exists."));
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      _id: new ObjectId(),
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await insertOne(newUser);
    if (!result.acknowledged) {
      return res
        .status(statusCodes.could_not_create)
        .json(userResponses.could_not_create("User could not be created."));
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(statusCodes.success).json(genericResponses.success(userWithoutPassword));
  }
} 