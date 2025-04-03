import { body, query } from "express-validator";
import { Types } from "mongoose";

export const categoryValidation = {
  userId: body("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  category: body("category")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .custom((category) => typeof category === "string")
    .escape(),

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