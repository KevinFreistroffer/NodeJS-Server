"use strict";

import express, { NextFunction, Request, Response, Express } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import helmet from "helmet";
import passport from "passport";
import cors from "cors";
import debug from "debug";
import http from "http";
import { verifyAccessKey, verifySessionToken } from "./middleware";
import * as fs from "fs";
import path from "path";
import { getErrorDetails, getFilePath } from "./utils";
import { responses, statusCodes } from "./defs/responses/generic";
import { stat, writeFile } from "fs/promises";
import { findOneById, insertOne } from "./operations/file_operations";
import { Timestamp } from "mongodb";
import { AsyncLocalStorage } from "node:async_hooks";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";
import { rateLimiterMiddleware } from "./middleware";
import { checkConflictingRouteMiddleware } from "./routes";

const PROTECTED_ROUTES = [
  "/user/:id",
  "/user/username-available",
  "/user/email-available",
  "/user/journal/create",
  "/user/journal/edit",
  "/user/journal/edit-many",
  "/user/journal/journals",
  "/user/journal/delete",
  "/user/journal/bulk-set-category",
  "/user/journal/deleteSelectedJournals",
  "/user/journal/deleteSelectedCategories",
  "/user/journal/updateJournalCategories",
  "/user/journal/category/create",
  "/user/journal/category/delete",
  "/user/journal/category/edit",
  "/auth/send-verification-email",
];
const ADMIN_ROUTES = [
  "/user/users",
  "/user/delete-all",
  "/user/journal/delete-all",
  "/auth/bearer",
];

checkConflictingRouteMiddleware();

dotenv.config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger-spec.json");

const port = parseInt(process.env.SERVER_PORT || "3001");
const asyncLocalStorage = new AsyncLocalStorage<string>();
let errorLogId = 0;

const setAsyncLocalStorageMsg = (msg: string) => {
  asyncLocalStorage.run(errorLogId.toString(), () => {
    errorLogId++;
  });
};

const server = express();

// Middleware
// ----------------------------------------------------
server.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
server.use(logger("dev"));
server.use(cookieParser());
server.use(helmet());
server.disable("x-powered-by");
const whitelist = ["http://localhost:3000", "127.0.0.1"];

server.use(passport.initialize());
server.use(express.json({ limit: "5mb" }));
server.use(express.urlencoded({ extended: true }));
server.use(rateLimiterMiddleware());
server.use("*", (req: Request, res: Response, next: NextFunction) => {
  setAsyncLocalStorageMsg("Setting async local storage message.");
  next();
});
server.use("*", (req: Request, res: Response, next: NextFunction) => {
  console.log("req.baseUrl", req.baseUrl, req.cookies);
  const adminOnlyRoutes = process.env.ADMIN_ROUTES?.split(",") || [];
  const protectedRoutes = process.env.PROTECTED_ROUTES?.split(",") || [];

  if (adminOnlyRoutes.find((route) => route === req.baseUrl.toLowerCase())) {
    return verifyAccessKey(req, res, next);
  }

  // Check for protected routes including dynamic routes
  const isProtected = protectedRoutes.some((route) => {
    // Convert route pattern to regex, handling :id specially for MongoDB ObjectID
    const pattern = route
      .replace(/:[^/]+/g, (match) => {
        // If the parameter is :id, match MongoDB ObjectID pattern
        return match === ":id" ? "[0-9a-fA-F]{24}" : "[^/]+";
      })
      .replace(/\//g, "\\/"); // Escape forward slashes
    const regex = new RegExp(`^${pattern}$`, "i");
    return regex.test(req.baseUrl);
  });

  console.log("IS PROTECTED", isProtected);

  if (isProtected) {
    return verifySessionToken(req, res, next);
  }

  next();
});

// Router
// ----------------------------------------------------
require("./router")(server);
server.use("/api-docs", swaggerUi.serve);
server.get("/api-docs", swaggerUi.setup(swaggerSpec));

// 404 & Error handling
// ----------------------------------------------------
// catch 404 and forward to error handler
server.use(function (req, res, next) {
  res.status(404).send(responses.route_not_found());
});

server.use(
  async (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) => {
    const details = getErrorDetails(error);
    const filePath = getFilePath(path.join(__dirname, "logs"), "error.log");

    const status = await stat(filePath);

    if (!status.isFile()) {
      //
    }

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
      date,
      dateMs: date.getTime(),
      url: req.url,
    });

    if (!insertDoc.insertedId) {
      throw new Error("Error inserting error document.");
    }

    const errorDoc = await findOneById(insertDoc.insertedId);

    if (!errorDoc) {
      throw new Error("Error finding inserted error document.");
    }

    return res
      .status(statusCodes.caught_error)
      .json(responses.something_went_wrong());
  }
);

// If node process ends, close mongoose connection
// ----------------------------------------------------
process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing server...");
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.log("Server Uncaught Exception: ", error);
  getErrorDetails(error);
});

process.on("unhandledRejection", (error) => {
  console.log("Server Uncaught Exception: ", error);
  getErrorDetails(error);
});

// Server Port
// ----------------------------------------------------
const listener = server.listen(port, () => {
  console.log("Listening on port " + port + ".");
});

const getListener = async () => {
  return listener;
};

const close = async () => {
  listener.close();
};

export { server, getListener, close };
