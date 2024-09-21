"use strict";

import * as express from "express";
import {
  IResponse,
  responses,
  statusCodes,
} from "../../../defs/responses/generic";
import { getFilePath } from "../../../utils";
import { stat } from "node:fs/promises";

const router = express.Router();

router.get(
  "/",
  async (
    req: express.Request,
    res: express.Response<IResponse>,
    next: express.NextFunction
  ) => {
    try {
      // ;
      const fileName = "lorem.txt";

      // Check if a file exists in the current directory
      const filePath = getFilePath(__dirname, fileName);

      const status = await stat(filePath);

      if (!status.isFile()) {
        return res
          .status(statusCodes.resource_not_found)
          .json(responses.route_not_found());
      }
      res.json(responses.success());
    } catch (error) {
      return next(error);
    } finally {
    }
  }
);

module.exports = router;
