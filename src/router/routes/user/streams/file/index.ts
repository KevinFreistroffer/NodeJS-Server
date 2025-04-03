import { Router } from "express";
import { fileValidation } from "./file.validation";
import { asyncRouteHandler } from "@/utils";
import { FileController } from "./file.controller";

const router = Router();

router.post(
  "/upload",
  fileValidation.userId,
  fileValidation.fileName,
  fileValidation.fileType,
  fileValidation.fileSize,
  fileValidation.chunkSize,
  fileValidation.totalChunks,
  fileValidation.currentChunk,
  fileValidation.returnUser,
  asyncRouteHandler(FileController.uploadChunk)
);

router.get(
  "/download",
  fileValidation.userId,
  fileValidation.fileName,
  fileValidation.returnUser,
  asyncRouteHandler(FileController.downloadFile)
);

module.exports = router;