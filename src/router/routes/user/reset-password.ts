"use strict";

import * as express from "express";
import * as nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import {
  IResponse,
  responses as genericResponses,
} from "../../../defs/responses/generic";
import { responses as userResponses } from "../../../defs/responses/user";
import { statusCodes } from "../../../defs/responses/status_codes";
import { updateOne } from "../../../operations/user_operations";
import { handleCaughtErrorResponse } from "../../../utils";
import dotenv from "dotenv";
import passwordHash from "password-hash";
dotenv.config();

const router = express.Router();
const validatedToken = body("token")
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();
const validatedPassword = body("password")
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedToken,
  validatedPassword,
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedErrors = validationResult(req).array();

      if (validatedErrors.length) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      // TODO: validate the JWT token. There needs to be an authentication step here prior to editing the password.

      const hashedPassword = passwordHash.generate(req.body.password);
      const doc = await updateOne(
        {
          resetPasswordToken: req.body.token,
          resetPasswordExpires: { $gt: new Date(Date.now()) },
        },
        { password: hashedPassword }
      );

      console.log(
        "/reset-password updatedDoc with resetPasswordToken & expires",
        doc
      );

      if (!doc.matchedCount) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      if (!doc.modifiedCount) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update());
      }

      // Updating user object
      // TODO: sanitize the password?
      // const hashedPassword = passwordHash.generate(req.body.password);
      // foundUser.password = hashedPassword;
      // foundUser.resetPasswordToken = undefined;
      // foundUser.resetPasswordExpires = undefined;

      if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error("Email credentials are not set in the environment.");
      }

      // Send Confirmation Email
      const transporter = nodemailer.createTransport(
        `smtps://${encodeURIComponent(
          process.env.EMAIL_FROM
        )}:${encodeURIComponent(process.env.EMAIL_APP_PASSWORD)}@smtp.gmail.com`
      );

      // setup e-mail data with unicode symbols
      const mailOptions = {
        from: '"iBlog 👥" <kevin.freistroffer@gmail.com>',
        to: "kevin.freistroffer@gmail.com", // TODO set this to the email
        subject: "Password Reset Confirmation",
        text:
          "Hi,\n\n" +
          "This is a confirmation that the password for your account has just been changed.\n",
      };

      // send mail with defined transport object
      await transporter.sendMail(mailOptions);

      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
