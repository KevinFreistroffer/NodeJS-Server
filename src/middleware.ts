import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { responses as genericResponses } from "./defs/responses/generic_responses";
dotenv.config();

interface CustomRequest extends Request {
  auth?: any;
}

export const rateLimiterMiddleware = () => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 create account requests per windowMs
    handler: (req: Request, res: Response, next: NextFunction) =>
      res.status(429).json(genericResponses.too_many_requests()),
    skip: (req: Request) =>
      req.ip === "127.0.0.1" || process.env.NODE_ENV === "development", // TODO: Remove this before deploying
  });

  console.log("LIMITER", limiter, typeof limiter);
  const v = limiter.getKey;
  console.log(v, typeof v);

  return limiter;
};

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader || typeof bearerHeader === "undefined") {
    return res.sendStatus(401);
  }

  const parts = bearerHeader.split(" ");
  if (parts.length < 2) {
    return res.sendStatus(401);
  }

  if (parts[0].toLocaleLowerCase() !== "bearer") {
    return res.sendStatus(401);
  }

  const token = parts[1];
  jwt.verify(token, process.env.JWT_SECRET as string, (err, authData) => {
    if (!authData || err) {
      return res.sendStatus(401);
    }

    res.locals.auth = authData;
    next();
  });
};

export const verifySessionToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const sessionToken = req.cookies.session_token;
  console.log("SESSION TOKEN", sessionToken);
  if (!sessionToken || typeof sessionToken === "undefined") {
    return res.sendStatus(401);
  }

  jwt.verify(
    sessionToken,
    process.env.JWT_SECRET as string,
    (err: any, authData: any) => {
      console.log("AUTH DATA", authData);
      console.log("ERR", err);
      if (!authData || err) {
        return res.sendStatus(401);
      }

      res.locals.auth = authData;
      next();
    }
  );
};

export const verifyAccessKey = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const accessKey = req.headers["access-key"];

  if (
    typeof accessKey === "undefined" ||
    accessKey !== process.env.API_ACCESS_KEY
  ) {
    return res.sendStatus(401);
  }

  next();
};
