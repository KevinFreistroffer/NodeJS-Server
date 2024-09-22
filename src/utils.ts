import { ObjectId } from "mongodb";
import { ISanitizedUser } from "./defs/interfaces";
import { forbiddenResponseFields } from "./defs/constants";
import * as bcrypt from "bcryptjs";
import path from "node:path";
import process from "node:process";
import { Request, Response } from "express";
import { responses, statusCodes } from "./defs/responses/generic";
import { insertOne } from "./operations/file_operations";
import { findOne } from "./operations/user_operations";
import { stat } from "node:fs";
import { writeFile } from "node:fs/promises";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const convertDocToSafeUser = (UNSAFE_DOC: any): ISanitizedUser => {
  const SAFE_DOC: ISanitizedUser & { _id: ObjectId } = {
    _id: UNSAFE_DOC._id,
    username: UNSAFE_DOC.username,
    // usernameNormalized: UNSAFE_DOC.usernameNormalized,
    email: UNSAFE_DOC.email,
    // emailNormalized: UNSAFE_DOC.emailNormalized,
    journals: UNSAFE_DOC.journals,
    journalCategories: UNSAFE_DOC.journalCategories,
    resetPasswordToken: UNSAFE_DOC.resetPasswordToken,
    // jwtToken: UNSAFE_DOC.jwtToken,
  };

  for (const field in forbiddenResponseFields) {
    if (field in SAFE_DOC) {
      throw new Error(`${field} field is not allowed in the SAFE_DOC object.`);
    }
  }

  return SAFE_DOC;
};

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  if (!salt) {
    throw new Error("Error generating salt.");
  }

  const hash = await bcrypt.hash(password, salt);

  if (!hash) {
    throw new Error("Error hashing password.");
  }

  return hash;
};

export const getRelativePath = (currentDirectory: string) => {
  return path.relative("./", currentDirectory);
};

export const getFilePath = (
  currentDirectory: string,
  fileName: string
): string => {
  const relativePath = getRelativePath(currentDirectory);
  return path.join(relativePath, fileName);
};

export const getErrorDetails = (
  error: any // TODO type?
): {
  message: string;
  stackTraceLimit?: string;
  cause?: string;
  code?: string;
  stack?: string;
} => ({
  stackTraceLimit: error.stackTraceLimit,
  cause: error.cause,
  code: error.code,
  message: error.message,
  stack: error.stack,
});

export const logUncaughtException = async (error: any, url: string) => {
  process.on("uncaughtException", async (error) => {
    const details = getErrorDetails(error);

    const filePath = getFilePath(path.join(__dirname, "logs"), "error.log");

    stat(filePath, (err, stats) => {
      if (err) {
        throw err;
      }
    });

    const date = new Date();
    const data = `
    Url: ${url}\n
    Date: ${date}\n
    Date in ms: ${date.getTime()}\n

    Message:${details.message}\n
    ____________________________
    `;

    await writeFile(filePath, data, { flag: "a" });

    const insertDoc = await insertOne({
      ...details,
      url,
      date,
      dateMs: date.getTime(),
    });

    if (!insertDoc.insertedId) {
      console.log("Error inserting error document.");
    }

    process.exit(0);
  });
};

export const handleCaughtErrorResponse = (
  error: unknown,
  req: Request,
  res: Response
) => {
  logUncaughtException(error, req.url);
  return res
    .status(statusCodes.caught_error)
    .json(responses.something_went_wrong());
};

export const sendAccountActivationEmail = async (
  toEmail: string,
  userId: string
) => {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Email credentials are not set in the environment.");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not set in the environment.");
  }

  console.log("userId", userId);
  console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  let verificationLink: string;

  if (process.env.environment === "development") {
    verificationLink = `http://localhost:3000/verify-account/${token}`;
  } else {
    verificationLink = `https://journal-app-production.up.railway.app/verify-account/${token}`;
  }
  const transport = `smtps://${encodeURIComponent(
    process.env.EMAIL_FROM
  )}:${encodeURIComponent(process.env.EMAIL_APP_PASSWORD)}@smtp.gmail.com`;
  console.log("transport: ", transport);
  const transporter = nodemailer.createTransport(
    `smtps://${encodeURIComponent(process.env.EMAIL_FROM)}:${encodeURIComponent(
      process.env.EMAIL_APP_PASSWORD
    )}@smtp.gmail.com`
  );

  // setup e-mail data with unicode symbols
  const mailOptions = {
    from: `"Journal App 👥" <${process.env.EMAIL_FROM}>`,
    // to: to, // Use the provided email address
    to:
      process.env.environment === "development"
        ? "kevin.freistroffer@gmail.com"
        : toEmail, // Use the provided email address
    subject: "Account Activation",
    text:
      "Hi,\n\n" +
      "Please confirm your account by clicking the following link: " +
      verificationLink +
      "\n\nThis link will expire in 24 hours.",
    html: `<p>Hi,</p>
      <p>Please confirm your account by clicking the following link:</p>
      <a href="${verificationLink}">Activate Your Account</a>
      <p>This link will expire in 24 hours.</p>`,
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (err, info) => {
    console.log("err: ", err);
    console.log("info: ", info);
    if (err) {
      throw err;
    }
  });
};

export const verifyJWT = (token: string, callback?: Function) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not set in the environment.");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

// THIS DOESNT WORK
export const isJwtPayload = (arg: any): arg is jwt.JwtPayload => {
  return arg && arg.data;
};

// TODO: Is this a Document or WithId<IUser>?
