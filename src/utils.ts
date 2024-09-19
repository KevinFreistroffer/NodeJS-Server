import { ObjectId } from "mongodb";
import { ISanitizedUser } from "./defs/interfaces";
import { forbiddenResponseFields } from "./defs/constants";
import * as bcrypt from "bcryptjs";
import path from "node:path";
import process from "node:process";
import { Request, Response } from "express";
import { responses, statusCodes } from "./defs/responses/generic";
import { findOneById, insertOne } from "./operations/file_operations";
import { stat } from "node:fs";
import { writeFile } from "node:fs/promises";

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

  for (let field in forbiddenResponseFields) {
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

export const getCaughtErrorDetails = (
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

// This is to ensure a response is sent to the end user.
// Not sure yet how to better do this, because it requires adding this to each request
// which is too much repeating, and it could get forgotten to get added to new routes.
export const logUncaughtException = async (req: Request, res: Response) => {
  process.on("uncaughtException", async (error) => {
    const details = getCaughtErrorDetails(error);
    const filePath = getFilePath(path.join(__dirname, "logs"), "error.log");

    stat(filePath, (err, stats) => {
      if (err) {
        throw err;
      }
    });

    const date = new Date();
    const data = `
    Url: ${req.url}\n
    Date: ${date}\n
    Date in ms: ${date.getTime()}\n
    Message:${details.message}\n
    ____________________________
    `;

    await writeFile(filePath, data, { flag: "a" });

    const insertDoc = await insertOne({
      ...details,
      url: res.req.url,
      date,
      dateMs: date.getTime(),
    });

    if (!insertDoc.insertedId) {
      console.log("Error inserting error document.");
    }

    const errorDoc = await findOneById(insertDoc.insertedId);

    if (!errorDoc) {
      console.log("Error finding inserted error document.");
    }

    res.status(statusCodes.caught_error).json(responses.something_went_wrong());

    process.exit(0);
  });
};

// export const verifyJWT = async (token: string) => {
//   if (!isJwtPayload(token)) {
//     throw new Error(
//       "Invalid JWT payload. The decoded value is not of type JwtPayload."
//     );
//   }

//   const callback = async (
//     error: VerifyErrors | null,
//     decoded: string | JwtPayload | undefined
//   ) => {
//     // Error decoding the JWT token
//     if (error) {
//       throw error;
//     }

//     if (!isJwtPayload(decoded)) {
//       throw new Error(
//         "Invalid JWT payload. The decoded value is not of type JwtPayload."
//       );
//     } else {
//       const users = await usersCollection();
//       // Find user by username or email
//       const doc = await users.findOne(
//         { _id: decoded.data },
//         { projection: UserProjection }
//       );

//       console.log("[Authenticate] found user by username or email: ", doc);
//       /*--------------------------------------------------
//        * User NOT found
//        *------------------------------------------------*/
//       if (!doc) {
//         throw new Error("User not found.");
//       }

//       /*--------------------------------------------------
//        * User found
//        *------------------------------------------------*/
//       console.log("Found a user by username/email.");
//       bcrypt.compare(
//         decoded.data.password,
//         doc.password,
//         (compareError, validPassword) => {
//           /*--------------------------------------------------
//            * Error comparing passwords
//            *------------------------------------------------*/
//           if (compareError) {
//             console.log(
//               "[Login] Error BCrypt comparing passwords: ",
//               compareError
//             );
//             throw new Error("Error BCrypt comparing passwords " + compareError);
//           }

//           /*--------------------------------------------------
//            * Invalid password
//            *------------------------------------------------*/
//           if (!validPassword) {
//             throw new Error("Invalid password.");
//           }

//           /*--------------------------------------------------
//            * Valid password
//            *------------------------------------------------*/
//           console.log("SUCCESSFULL login");
//           return true;
//         }
//       );
//     }
//   };

//   const bird = verify(token, config.jwtSecret, callback);
//   console.log(bird);

//   function* generator(i: any) {
//     yield bird;
//     yield i + 10;
//   }

//   const gen = generator(10);
//   console.log(gen.next().value);
//   // Expected output: 10

//   console.log(gen.next().value);
// };

// export const isJwtPayload = (arg: any): arg is JwtPayload => {
//   return arg && arg.data;
// };

// TODO: Is this a Document or WithId<IUser>?
