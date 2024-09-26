"use strict";

import * as express from "express";
import {
  IResponse,
  responses,
  statusCodes,
} from "../../../defs/responses/generic";
import { handleCaughtErrorResponse } from "../../../utils";
import { has } from "lodash";
import jwt from "jsonwebtoken";
import { findOneById } from "../../../operations/user_operations";
import { ObjectId } from "mongodb";
const router = express.Router();

router.get(
  "/",
  async (req: express.Request, res: express.Response<IResponse>) => {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set");
      }

      console.log(req.headers);
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.send(responses.success());
      }

      console.log("authHeader", authHeader);

      const [bearer, token] = authHeader.split(" ");
      console.log("bearer", bearer);
      console.log("token", token);
      if (bearer.toLowerCase() !== "bearer" || !token) {
        return res.send(responses.success());
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded", decoded);

      if (!decoded || !has(decoded, "data")) {
        return res.send(responses.success());
      }

      const user = await findOneById(new ObjectId(decoded.data as string));
      console.log("user", user);

      if (!user || !user._id) {
        return res.send(responses.access_denied());
      }

      // TODO: implement
      return res.json(responses.success());
    } catch (error) {
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);

module.exports = router;

// "use strict";

// import { users as mockUsers } from "../../../data/mock_users";

// import * as express from "express";
// import { verify, JwtPayload } from "jsonwebtoken";
// import * as bcrypt from "bcryptjs";
// import { User, UserProjection } from "../../../defs/models/user.model";
// import { Types } from "mongoose";
// import { body, validationResult } from "express-validator";
// import { has } from "lodash";
// import { IResponse, responses } from "../../../defs/responses";
// import { usersCollection } from "../../../db";
// import { isJwtPayload, verifyJWT } from "../../../utils";
// const router = express.Router();

// router.post(
//   "/",
//   body("token").notEmpty().bail().isString().bail().escape(),
//   async (
//     req: express.Request<any, any, { token: string }>,
//     res: express.Response<IResponse>
//   ) => {
//     try {
//       const validatedErrors = validationResult(req).array();
//       if (validatedErrors.length) {
//         res.status(422).json(responses.missing_body_fields());

//         return;
//       }
//       let token = req.body.token;

//       console.log("/authenticate reached...");
//       console.log("request body data: ", req.body);

//      const resp = await verifyJWT(token);
//         console.log(resp);
//         verify(token, config.jwtSecret, async (decodeError, decoded) => {
//           // Error decoding the JWT token
//           if (decodeError) {
//             throw decodeError;
//           }

//           if (!isJwtPayload(decoded)) {
//             throw new Error(
//               "Invalid JWT payload. The decoded value is not of type JwtPayload."
//             );
//           } else {
//             const users = await usersCollection();
//             // Find user by username or email
//             const doc = await users.findOne(
//               { _id: decoded.data },
//               { projection: UserProjection }
//             );

//             console.log(
//               "[Authenticate] found user by username or email: ",
//               doc
//             );
//             /*--------------------------------------------------
//              * User NOT found
//              *------------------------------------------------*/
//             if (!doc) {
//               return res.status(200).json(responses.user_not_found());
//             }

//             /*--------------------------------------------------
//              * User found
//              *------------------------------------------------*/
//             console.log("Found a user by username/email.");
//             bcrypt.compare(
//               decoded.data.password,
//               doc.password,
//               (compareError, validPassword) => {
//                 /*--------------------------------------------------
//                  * Error comparing passwords
//                  *------------------------------------------------*/
//                 if (compareError) {
//                   console.log(
//                     "[Login] Error BCrypt comparing passwords: ",
//                     compareError
//                   );
//                   throw new Error(
//                     "Error BCrypt comparing passwords " + compareError
//                   );
//                 }

//                 /*--------------------------------------------------
//                  * Invalid password
//                  *------------------------------------------------*/
//                 if (!validPassword) {
//                   return res.status(200).json(responses.invalid_password());
//                 }

//                 /*--------------------------------------------------
//                  * Valid password
//                  *------------------------------------------------*/
//                 console.log("SUCCESSFULL login");
//                 return res.json(responses.success(doc));
//               }
//             );
//           }
//         });
//     } catch (error) {
//       console.log("[/authenticate] Caught error. Error: ", error);
//       return res.status(500).json(responses.caught_error(error));
//     }
//   }
// );

// module.exports = router;
