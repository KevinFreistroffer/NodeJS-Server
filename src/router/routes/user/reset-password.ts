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
import {
  handleCaughtErrorResponse,
  generateResetPasswordToken,
} from "../../../utils";
import dotenv from "dotenv";
import passwordHash from "password-hash";
import { verifyJWT } from "../../../utils";
import { ObjectId } from "mongodb";
import { findOneById, findOne } from "../../../operations/user_operations";
import { has } from "lodash";
import jwt from "jsonwebtoken";
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

      if (
        !process.env.EMAIL_FROM ||
        !process.env.EMAIL_APP_PASSWORD ||
        !process.env.NODE_ENV
      ) {
        // TODO: make this a specific error. Email creds missing. Node env not set.
        throw new Error("Email credentials or node environment are not set.");
      }
      let description = "Password changed.";
      let mailOptions = {
        from: "",
        to: "",
        subject: "",
        text: "",
        html: "",
      };

      const { token } = req.body;

      const userDoc = await findOne({
        query: {
          email: req.body.email,
          resetPasswordToken: token,
        },
        sanitize: true,
      });

      if (!userDoc) {
        return res
          .status(statusCodes.access_denied)
          .json(genericResponses.access_denied());
      }

      // Verify that the provided token matches the stored token
      if (userDoc.resetPasswordToken !== token) {
        return res
          .status(statusCodes.invalid_request)
          .json(
            genericResponses.invalid_request("Invalid reset password token")
          );
      }

      const hashedPassword = passwordHash.generate(req.body.password);
      const {
        token: resetPasswordToken,
        expirationDate: resetPasswordExpires,
      } = generateResetPasswordToken(3); // 3 hours

      // Save the new token and expiration in the database
      const updateResult = await updateOne(
        { _id: userDoc._id },
        {
          password: hashedPassword,
          resetPasswordToken,
          resetPasswordExpires,
          resetAttempts: [
            {
              timestamp: new Date().toISOString(),
            },
          ],
        }
      );

      if (!updateResult.matchedCount || !updateResult.modifiedCount) {
        return res
          .status(statusCodes.could_not_update)
          .json(userResponses.could_not_update());
      }

      // // Update token in the request body for further processing
      // req.body.token = resetPasswordToken; // Why?
      // Updating user object
      // TODO: sanitize the password?
      // const hashedPassword = passwordHash.generate(req.body.password);
      // foundUser.password = hashedPassword;
      // foundUser.resetPasswordToken = undefined;
      // foundUser.resetPasswordExpires = undefined;

      // Verify that the reset password token has not expired
      if (
        !userDoc.resetPasswordExpires ||
        userDoc.resetPasswordExpires < new Date()
      ) {
        description =
          "The reset password link expired. A new reset password link was sent to your email.";
        mailOptions = {
          from: `Password Reset 👥 <${
            process.env.EMAIL_FROM || "kevin.freistroffer@gmail.com"
          }>`, // sender address
          to: `${
            process.env.NODE_ENV === "development"
              ? "kevin.freistroffer@gmail.com"
              : userDoc.email
          }`, // list of receivers
          subject: "Reset Password", // Subject line
          text:
            `Your password reset link expired. Use this link to change your password. This link will be good for ${
              process.env.EMAIL_RESET_PASSWORD_EXPIRATION_HOURS || "3"
            } hours: http://` +
            req.headers.host +
            "/reset-password/" +
            token +
            "\n\n", // plaintext body
          html:
            `Your password reset link expired. Use this link to change your password. This link will be good for ${
              process.env.EMAIL_RESET_PASSWORD_EXPIRATION_HOURS || "3"
            } hours: http://` +
            req.headers.host +
            "/reset-password/" +
            token +
            "\n\n", // plaintext body
        };
      } else {
        mailOptions = {
          from: `"iBlog 👥" <${
            process.env.EMAIL_FROM || "kevin.freistroffer@gmail.com"
          }>`,
          to:
            process.env.NODE_ENV === "development"
              ? "kevin.freistroffer@gmail.com"
              : userDoc.email,
          subject: "Password Successfully Changed",
          text: "Hi,\n\nThis is a confirmation that the password for your account has just been changed.\n",
          html: "Hi,\n\nThis is a confirmation that the password for your account has just been changed.\n",
        };
      }

      // Send Email
      await nodemailer
        .createTransport(
          `smtps://${encodeURIComponent(
            process.env.EMAIL_FROM
          )}:${encodeURIComponent(
            process.env.EMAIL_APP_PASSWORD
          )}@smtp.gmail.com`
        )
        .sendMail(mailOptions);

      return res
        .status(statusCodes.success)
        .json(genericResponses.success(undefined, description));
    } catch (error) {
      console.log("error: ", error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
