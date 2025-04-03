import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { findOneById, updateOne } from "@/operations/user_operations";
import { responses as userResponses } from "@/defs/responses/user";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";
import { statusCodes } from "@/defs/responses/status_codes";
import { createWriteStream, createReadStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { ISanitizedUser } from "@/defs/interfaces";

interface IFileChunk {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  chunkSize?: number;
  totalChunks?: number;
  currentChunk?: number;
  data: Buffer;
}

interface IFile {
  _id: ObjectId;
  fileName: string;
  fileType: string;
  fileSize: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserWithFiles extends ISanitizedUser {
  files: IFile[];
}

export class FileController {
  static async uploadChunk(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, fileName, fileType, fileSize, chunkSize, totalChunks, currentChunk } = req.body;
    const returnUser = req.query.returnUser === "true";

    // Check if user exists
    const user = await findOneById(new ObjectId(userId));
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", userId);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Create file path
    const filePath = join(uploadsDir, fileName);

    try {
      // If this is the first chunk, create a new file
      if (currentChunk === 0) {
        const writeStream = createWriteStream(filePath);
        await pipeline(req, writeStream);
      } else {
        // Append to existing file
        const writeStream = createWriteStream(filePath, { flags: "a" });
        await pipeline(req, writeStream);
      }

      // If this is the last chunk, update user's files array
      if (currentChunk === totalChunks - 1) {
        const result = await updateOne(
          { _id: new ObjectId(userId) },
          {
            $push: {
              files: {
                _id: new ObjectId(),
                fileName,
                fileType,
                fileSize,
                path: filePath,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          }
        );

        if (!result.matchedCount || result.modifiedCount === 0) {
          return res
            .status(statusCodes.could_not_update)
            .json(userResponses.could_not_update("File information could not be saved."));
        }
      }

      if (returnUser) {
        const updatedUser = await findOneById(new ObjectId(userId));
        if (!updatedUser) {
          return res
            .status(statusCodes.user_not_found)
            .json(userResponses.user_not_found("User not found."));
        }
        return res.status(statusCodes.success).json(genericResponses.success(updatedUser));
      }

      return res.status(statusCodes.success).json(genericResponses.success());
    } catch (error) {
      return res
        .status(statusCodes.could_not_update)
        .json(userResponses.could_not_update("File chunk could not be processed."));
    }
  }

  static async downloadFile(req: Request, res: Response<IResponse>) {
    const validatedFields = validationResult(req);
    if (!validatedFields.isEmpty()) {
      return res
        .status(statusCodes.missing_body_fields)
        .json(genericResponses.missing_body_fields());
    }

    const { userId, fileName } = req.body;

    // Check if user exists
    const user = await findOneById(new ObjectId(userId)) as IUserWithFiles;
    if (!user) {
      return res
        .status(statusCodes.user_not_found)
        .json(userResponses.user_not_found("User not found."));
    }

    // Find the file
    const file = user.files.find((f: IFile) => f.fileName === fileName);
    if (!file) {
      return res
        .status(statusCodes.resource_not_found)
        .json(genericResponses.resource_not_found(`File ${fileName} not found.`));
    }

    // Check if file exists
    if (!existsSync(file.path)) {
      return res
        .status(statusCodes.resource_not_found)
        .json(genericResponses.resource_not_found(`File ${fileName} not found on disk.`));
    }

    // Set response headers
    res.setHeader("Content-Type", file.fileType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Stream the file
    const readStream = createReadStream(file.path);
    await pipeline(readStream, res);
  }
} 