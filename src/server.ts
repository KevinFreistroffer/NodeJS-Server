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
import { verifyAccessKey, verifyToken } from "./middleware";
import * as fs from "fs";
import path from "path";
import { getCaughtErrorDetails, getFilePath } from "./utils";
import { responses, statusCodes } from "./defs/responses/generic";
import { stat, writeFile } from "fs/promises";
import { findOneById, insertOne } from "./operations/file_operations";
import { Timestamp } from "mongodb";
import { AsyncLocalStorage } from "node:async_hooks";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

dotenv.config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger-spec.json");

export default class Server {
  port: number;
  server!: Express;
  listener!: http.Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >;
  asyncLocalStorage: AsyncLocalStorage<string>;
  errorLogId: number = 0;

  constructor(port?: number) {
    if (port) {
      this.port = port;
    } else {
      this.port = parseInt(process.env.SERVER_PORT || "3001");
    }

    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  setAsyncLocalStorageMsg(msg: string) {
    this.asyncLocalStorage.run(this.errorLogId.toString(), () => {
      this.errorLogId++;
    });
  }

  async start() {
    try {
      this.server = express();

      // Middleware
      // ----------------------------------------------------
      this.server.use(logger("dev"));

      this.server.use(cookieParser());
      this.server.use(helmet());
      this.server.disable("x-powered-by");
      this.server.use(cors());
      this.server.use(passport.initialize());
      this.server.use(express.json());
      this.server.use(express.urlencoded({ extended: true }));
      this.server.use(
        "*",
        (req: Request, res: Response, next: NextFunction) => {
          this.setAsyncLocalStorageMsg("Setting async local storage message.");

          next();
        }
      );
      this.server.use(
        "*",
        (req: Request, res: Response, next: NextFunction) => {
          const adminOnlyRoutes = process.env.ADMIN_ROUTES?.split(",") || [];
          const protectedRoutes =
            process.env.PROTECTED_ROUTES?.split(",") || [];

          if (
            adminOnlyRoutes.find((route) => route === req.baseUrl.toLowerCase())
          ) {
            return verifyAccessKey(req, res, next);
          }

          if (
            protectedRoutes.find((route) => route === req.baseUrl.toLowerCase())
          ) {
            return verifyToken(req, res, next);
          }

          next();
        }
      );

      // Router
      // ----------------------------------------------------
      require("./router")(this.server);
      this.server.use("/api-docs", swaggerUi.serve);
      this.server.get("/api-docs", swaggerUi.setup(swaggerSpec));

      // 404 & Error handling
      // ----------------------------------------------------
      // catch 404 and forward to error handler
      this.server.use(function (req, res, next) {
        res.status(404).send(responses.route_not_found());
      });

      this.server.use(
        async (
          error: Error,
          req: express.Request,
          res: express.Response,
          next: NextFunction
        ) => {
          const details = getCaughtErrorDetails(error);
          const filePath = getFilePath(
            path.join(__dirname, "logs"),
            "error.log"
          );

          const status = await stat(filePath);

          if (!status.isFile()) {
            // Create the file
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

        getCaughtErrorDetails(error);
      });

      process.on("unhandledRejection", (error) => {
        console.log("Server Uncaught Exception: ", error);

        getCaughtErrorDetails(error);
      });

      // Server Port
      // ----------------------------------------------------
      this.listener = this.server.listen(this.port, () => {
        console.log("Listening on port " + this.port + ".");
      });

      return this.server;
    } catch (error: any) {
      this.listener.close();
      throw error;
    }
  }

  async getListener() {
    return this.listener;
  }

  async close() {
    this.listener.close();
  }
}

export const run = () => {
  if (process.env.SERVER_PORT) {
    new Server(parseInt(process.env.SERVER_PORT)).start();
  } else {
    new Server().start();
  }
};

run();
