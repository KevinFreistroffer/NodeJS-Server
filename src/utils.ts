import { ObjectId } from "mongodb";
import { ISanitizedUser } from "./defs/interfaces";
import { forbiddenResponseFields } from "./defs/constants";
import * as bcrypt from "bcryptjs";
import path from "node:path";
import process from "node:process";
import { Request, Response, NextFunction } from "express";
import { responses, statusCodes } from "./defs/responses/generic";
import { insertOne } from "./operations/file_operations";
import { findOne } from "./operations/user_operations";
import { stat } from "node:fs";
import { writeFile } from "node:fs/promises";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { WithId } from "mongodb";
import crypto from "node:crypto";
import { GridFSBucket } from "mongodb";
import { getClient } from "./db";

export const convertDocToSafeUser = ({
  _id,
  username,
  email,
  journals,
  journalCategories,
  reminders,
  resetPasswordToken,
  resetPasswordTokenExpires,
  resetPasswordAttempts,
  isVerified,
  createdAt,
  updatedAt,
  hasAcknowledgedHelperText,
  avatar,
  name,
  bio,
  company,
  location,
  website,
  sex,
  role,
  disabled,
}: WithId<ISanitizedUser>): ISanitizedUser => {
  const SAFE_DOC: ISanitizedUser = {
    _id,
    username,
    email,
    journals,
    journalCategories,
    reminders,
    resetPasswordToken,
    resetPasswordTokenExpires,
    resetPasswordAttempts,
    isVerified,
    createdAt,
    updatedAt,
    hasAcknowledgedHelperText,
    avatar,
    name,
    bio,
    company,
    location,
    website,
    sex,
    role,
    disabled,
    // jwtToken,
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

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  let verificationLink: string;

  if (process.env.NODE_ENV === "development") {
    verificationLink = `http://localhost:3000/verify-account/${token}`;
  } else {
    verificationLink = `https://journal-app-production.up.railway.app/verify-account/${token}`;
  }
  const transport = `smtps://${encodeURIComponent(
    process.env.EMAIL_FROM
  )}:${encodeURIComponent(process.env.EMAIL_APP_PASSWORD)}@smtp.gmail.com`;

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
      process.env.NODE_ENV === "development"
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
    if (err) {
      throw err;
    }
  });
};

export const sendResetPasswordEmail = async (
  toEmail: string,
  resetToken: string
) => {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Email credentials are not set in the environment.");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not set in the environment.");
  }

  const url = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const mailConfiguration = {
    transporter: nodemailer.createTransport(
      `smtps://${encodeURIComponent(process.env.EMAIL_FROM)}:${encodeURIComponent(
        process.env.EMAIL_APP_PASSWORD
      )}@smtp.gmail.com`),
    options: {
      from: `"Journal App 👥" <${process.env.EMAIL_FROM}>`,
      // to: to, // Use the provided email address
      to:
        process.env.NODE_ENV === "development"
          ? "kevin.freistroffer@gmail.com"
          : toEmail, // Use the provided email address
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) has requested a password reset.
      Please click on the following link to reset your password: ${url}
      If you did not request this, please ignore this email.`,
      html: `
        <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
        <p>Please click on the following link to reset your password:</p>
        <a href="${url}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    }
  }


  // send mail with defined transport object
  mailConfiguration.transporter.sendMail(mailConfiguration.options, (err, info) => {
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

export const sanitizeUser = (user: any): ISanitizedUser => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    journals: user.journals,
    journalCategories: user.journalCategories,
    reminders: user.reminders,
    resetPasswordToken: user.resetPasswordToken,
    resetPasswordTokenExpires: user.resetPasswordTokenExpires,
    resetPasswordAttempts: user.resetPasswordAttempts,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    hasAcknowledgedHelperText: user.hasAcknowledgedHelperText,
    avatar: user.avatar,
    role: user.role,
    disabled: user.disabled,
  };
};

export const formatSessionCookie = (token: string) => {
  return {
    "Access-Control-Allow-Origin": "*", // Allow all origins (or specify your frontend's origin)
    "Access-Control-Expose-Headers": "Set-Cookie",
    "Set-Cookie": `session_token=${token}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""
      }Max-Age=${14 * 24 * 60 * 60};  SameSite=None${process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
  };
};

export const generateResetPasswordToken = (expiresInHours: number = 3) => {
  const token = crypto.randomBytes(20).toString("hex");
  const expirationDate = new Date();
  expirationDate.setTime(
    expirationDate.getTime() + expiresInHours * 60 * 60 * 1000
  ); // 3 hours
  return { token, expirationDate };
};

// X integration
// Generate PKCE challenge
export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export async function getAvatarStream(userId: string): Promise<{
  _id: ObjectId;
  stream: NodeJS.ReadableStream;
  contentType: string | undefined;
} | null> {
  const client = await getClient();
  await client.connect();
  const db = client.db(process.env.DATABASE_NAME);
  const bucket = new ObjectId(userId);
  const avatarBucket = new GridFSBucket(db, {
    bucketName: "avatars",
  });

  const files = await avatarBucket
    .find({ "metadata.userId": bucket })
    .toArray();

  if (!files.length) {
    return null;
  }

  return {
    _id: files[0]._id,
    contentType: files[0].contentType,
    stream: avatarBucket.openDownloadStream(files[0]._id),
  };
}

/**
 * Converts a stream to a base64 data URL
 * @param stream The readable stream to convert
 * @param contentType The MIME type of the content
 * @returns Promise<string> The base64 data URL
 */
export async function streamToDataURL(
  stream: NodeJS.ReadableStream,
  contentType: string
): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Uint8Array);
  }
  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString("base64");
  return `data:${contentType};base64,${base64}`;
}

// Helper function to get file extension
export const getFileExtension = (filename: string): string => {
  return filename.substring(filename.lastIndexOf("."));
};

export const asyncRouteHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error) => handleCaughtErrorResponse(error, req, res));
  };
};
