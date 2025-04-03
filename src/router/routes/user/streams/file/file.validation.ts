import { body, query } from "express-validator";
import { Types } from "mongoose";

export const fileValidation = {
  userId: body("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  fileName: body("fileName")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .custom((fileName) => typeof fileName === "string")
    .escape(),

  fileType: body("fileType")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .custom((fileType) => typeof fileType === "string")
    .escape(),

  fileSize: body("fileSize")
    .notEmpty()
    .bail()
    .isNumeric()
    .bail()
    .custom((size) => {
      const num = Number(size);
      if (num <= 0) {
        throw new Error("File size must be greater than 0");
      }
      return true;
    }),

  chunkSize: body("chunkSize")
    .optional()
    .isNumeric()
    .bail()
    .custom((size) => {
      const num = Number(size);
      if (num <= 0) {
        throw new Error("Chunk size must be greater than 0");
      }
      return true;
    }),

  totalChunks: body("totalChunks")
    .optional()
    .isNumeric()
    .bail()
    .custom((chunks) => {
      const num = Number(chunks);
      if (num <= 0) {
        throw new Error("Total chunks must be greater than 0");
      }
      return true;
    }),

  currentChunk: body("currentChunk")
    .optional()
    .isNumeric()
    .bail()
    .custom((chunk) => {
      const num = Number(chunk);
      if (num < 0) {
        throw new Error("Current chunk must be greater than or equal to 0");
      }
      return true;
    }),

  returnUser: query("returnUser")
    .optional()
    .isString()
    .bail()
    .custom((value) => {
      if (value && !["true", "false"].includes(value.toLowerCase())) {
        throw new Error('returnUser must be "true" or "false" (case insensitive)');
      }
      return true;
    })
}; 