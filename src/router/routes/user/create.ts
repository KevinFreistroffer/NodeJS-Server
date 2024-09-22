"use strict";

import * as express from "express";
import { User } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { responses, statusCodes } from "../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../defs/responses/generic_responses";
import {
  convertDocToSafeUser,
  handleCaughtErrorResponse,
} from "../../../utils";
import {
  findOneByUsernameOrEmail,
  findOneById,
  insertOne,
} from "../../../operations/user_operations";
import { sendAccountActivationEmail } from "../../../utils";
const router = express.Router();

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
  body([
    "username",
    // "userId",
    "password",
  ])
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape(),
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

      if (doc) {
        return res.json(responses.username_or_email_already_registered());
      }

      const insertDoc = await insertOne(new User(username, email, password));

      if (!insertDoc || !insertDoc.insertedId) {
        return res.json(responses.error_inserting_user());
      }

      const userDoc = await findOneById(insertDoc.insertedId);

      if (!userDoc) {
        return res.json(responses.user_not_found());
      }

      await sendAccountActivationEmail(email, userDoc._id.toString());

      return res.json(responses.success(convertDocToSafeUser(userDoc)));
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
