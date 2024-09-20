import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface CustomRequest extends Request {
  auth?: any;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("verifyBearerToken()");
  const bearerHeader = req.headers["authorization"];
  console.log("bearerHeader", bearerHeader);
  if (!bearerHeader || typeof bearerHeader === "undefined") {
    return res.sendStatus(401);
  }

  const parts = bearerHeader.split(" ");
  console.log("parts", parts);
  if (parts.length < 2) {
    return res.sendStatus(401);
  }

  if (parts[0].toLocaleLowerCase() !== "bearer") {
    return res.sendStatus(401);
  }

  const token = parts[1]; // Extract token from header
  console.log("token", token);
  jwt.verify(token, process.env.JWT_SECRET as string, (err, authData) => {
    console.log("authData", authData);
    if (!authData || err) {
      return res.sendStatus(401);
    }

    res.locals.auth = authData;
    next(); // Proceed to next middleware or route handler
  });
};

export const verifyAccessKey = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("verifyAccessKey()");
  console.log("req.headers", req.headers);
  const accessKey = req.headers["access-key"];

  if (
    typeof accessKey === "undefined" ||
    accessKey !== process.env.API_ACCESS_KEY
  ) {
    return res.sendStatus(401);
  }

  next();
};
