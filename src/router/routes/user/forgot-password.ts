"use strict";

import * as express from "express";
import * as nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import { responses } from "../../../defs/responses/user";
import {
  responses as genericResponses,
  IResponse,
} from "../../../defs/responses/generic_responses";
import { responses as userResponses } from "../../../defs/responses/user";
import { updateOne } from "../../../operations/user_operations";
import { logUncaughtException } from "../../../utils";
import { EStage } from "../../../defs/enums";
const router = express.Router();
let crypto = require("node:crypto");

router.post(
  "/",
  body("email").isEmail().bail().normalizeEmail(),
  async (
    req: express.Request<any, any, { email: string }>,
    res: express.Response<IResponse>
  ) => {
    try {
      const validatedErrors = validationResult(req).array();

      if (validatedErrors.length) {
        return res.status(422).json(genericResponses.missing_body_fields());
      }

      const { email } = req.body;
      const token = crypto.randomBytes(20).toString("hex");
      const date = new Date();
      date.setTime(date.getTime() + 3 * 60 * 60 * 1000); // 3 hours
      const doc = await updateOne(
        { email },
        { resetPasswordToken: token, resetPasswordExpires: date }
      );

      if (!doc.acknowledged) {
        console.log("User not found.");

        return res.status(200).json(userResponses.user_not_found());
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
      // foundUser.resetPasswordExpires = date;
      // // Save the user.

      // const savedUser = await foundUser.save().toArray();
      // console.log(savedUser);

      /*--------------------------------------------------
       * Send the password reset email
       *------------------------------------------------*/
      const transporter = nodemailer.createTransport(
        "smtps://" +
          process.env.EMAIL_FROM +
          ":" +
          process.env.EMAIL_PASSWORD +
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
          "Click the link to change your password. This link will be good for 3 hours: http://" +
          req.headers.host +
          "#/reset-password/" +
          token +
          "\n\n", // plaintext body
        html:
          "Click the link to change your password. This link will be good for 3 hours: <br /> <h1 style=\"font-size: 16px; font-family: 'Tahoma', geneva, sans-serif; color: #333 !important; padding: 10px 0;\">http://" +
          req.headers.host +
          "#/reset-password/" +
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

      return res.json(genericResponses.success());
    } catch (error) {
      return res.status(500).json(genericResponses.caught_error(error));
    }
  }
);

module.exports = router;
