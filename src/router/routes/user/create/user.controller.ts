import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { insertOne, findOneByEmail, findOneByUsername } from "@/db/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse, statusCodes } from "@/defs/responses/generic";
import { errorCodes } from "@/defs/responses/status_codes";
import { UserRole, IUserCreate } from "@/defs/interfaces";
import { sanitizeUser } from "@/utils";

export class UserController {
  static async create(req: Request, res: Response<IResponse>) {

    const validatedFields = validationResult(req);
    console.log("validatedFields", validatedFields);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }


    const { username, email, password } = req.body;


    // Check if username or email already exists
    const existingUsername = await findOneByUsername(username);
    console.log("existingUsername", existingUsername);
    if (existingUsername) {
      return res
        .status(statusCodes.resource_unavailable)
        .json(userResponses.resource_exists("Username already exists."));
    }

    const existingEmail = await findOneByEmail(email);
    console.log("existingEmail", existingEmail);
    if (existingEmail) {
      return res
        .status(statusCodes.resource_unavailable)
        .json(userResponses.resource_exists("Email already exists."));
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: IUserCreate = {
      username,
      email,
      password: hashedPassword,
      firstName: "TODO ADD THIS IN FRONT END",
      lastName: "TODO ADD THIS IN FRONT END",
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      role: UserRole.MEMBER,
      disabled: false,
      hasAcknowledgedHelperText: false,
      resetPasswordToken: "",
      resetPasswordTokenExpires: null,
      resetPasswordAttempts: [],
      journals: [],
      journalCategories: [],
      reminders: [],
    };

    // console.log(newUser);

    const result = await insertOne(newUser);
    console.log("result", result, result.acknowledged, result.insertedId);
    if (!result.acknowledged && !result.insertedId) {
      return res
        .status(statusCodes.something_went_wrong)
        .json(userResponses.could_not_create("User could not be created."));
    }

    const successData = sanitizeUser(newUser);
    console.log("successData", successData);

    return res.json(genericResponses.success(successData));
  }
} 