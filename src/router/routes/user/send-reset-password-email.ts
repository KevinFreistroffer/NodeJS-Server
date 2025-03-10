"use strict";

import * as express from "express";
import * as nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import {
  responses as genericResponses,
  IResponse,
} from "../../../defs/responses/generic";
import { responses as userResponses } from "../../../defs/responses/user";
import { statusCodes } from "../../../defs/responses/status_codes";
import { updateOne } from "../../../operations/user_operations";
import { EStage } from "../../../defs/enums";
import crypto from "node:crypto";
import {
  handleCaughtErrorResponse,
  generateResetPasswordToken,
} from "../../../utils";
const router = express.Router();

router.post(
  "/",
  body("email").isEmail().bail().normalizeEmail(),
  body("redirectURL").isURL({ require_tld: false }).bail(),
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      const validatedErrors = validationResult(req).array();

      if (validatedErrors.length) {
        return res
          .status(statusCodes.missing_body_fields)
          .json(genericResponses.missing_body_fields());
      }

      const { email } = req.body;
      let { redirectURL } = req.body;

      const { token, expirationDate } = generateResetPasswordToken();
      const doc = await updateOne(
        { email },
        {
          $set: {
            resetPasswordToken: token,
            resetPasswordTokenExpires: expirationDate,
            resetPasswordAttempts: [
              {
                timestamp: new Date().toISOString(),
              },
            ],
          },
        }
      );

      if (!doc.acknowledged) {
        return res
          .status(statusCodes.user_not_found)
          .json(userResponses.user_not_found());
      }

      /*--------------------------------------------------
       * User found
       *------------------------------------------------*/
      // Generate a password reset token.
      // const token = crypto.randomBytes(20).toString("hex");
      // foundUser.resetPasswordToken = token;
      // // Set token expiration time to 3 hours.
      // // const date = new Date();
      // // const hoursToAdd = 3 * 60 * 60 * 1000; // 3 hours
      // date.setTime(date.getTime() + hoursToAdd);
      // foundUser.resetPasswordTokenExpires = date;
      // // Save the user.

      // const savedUser = await foundUser.save().toArray();
      //

      /*--------------------------------------------------
       * Send the password reset email
       *------------------------------------------------*/
      // Ensure redirectURL ends with a '/'
      if (!redirectURL.endsWith("/")) {
        redirectURL += "/";
      }
      const transport =
        "smtps://" +
        process.env.EMAIL_FROM +
        ":" +
        process.env.EMAIL_APP_PASSWORD +
        "@smtp.gmail.com";

      const transporter = nodemailer.createTransport(
        "smtps://" +
          process.env.EMAIL_FROM +
          ":" +
          process.env.EMAIL_APP_PASSWORD +
          "@smtp.gmail.com"
      );
      const mailOptions = {
        from: `Password Reset 👥 <${process.env.EMAIL_FROM}>`, // sender address
        to: `${
          process.env.NODE_ENV === EStage.DEVELOPMENT
            ? process.env.EMAIL_FROM
            : email
        }`, // list of receivers
        subject: "Reset Password", // Subject line
        text:
          "Click the link to change your password. This link will be good for 3 hours: " +
          redirectURL +
          token +
          "\n\n", // plaintext body
        html:
          "Click the link to change your password. This link will be good for 3 hours: <br /> <h1 style=\"font-size: 16px; font-family: 'Tahoma', geneva, sans-serif; color: #333 !important; padding: 10px 0;\">" +
          redirectURL +
          token +
          "</h1>" +
          "\n\n", // html body
      };

      transporter.sendMail(mailOptions, (emailSendError) => {
        if (emailSendError) {
          // TODO how to implement the {cause: error} in the Error(). Might require a TSConfig setting. Not sure.
          throw new Error(
            "Error sending email. Error: " + emailSendError.message
          );
        }
      });

      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;
