import { body, query } from "express-validator";
import { Types } from "mongoose";

export const avatarValidation = {
  userId: body("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  data: body("data")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .custom((value) => {
      // Check if the string is a valid base64 encoded image
      const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
      if (!base64Regex.test(value)) {
        throw new Error("Invalid image format. Must be a base64 encoded image (PNG, JPEG, JPG, or GIF).");
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