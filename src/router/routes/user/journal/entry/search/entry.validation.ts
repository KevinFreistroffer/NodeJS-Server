import { body, query } from "express-validator";
import { Types } from "mongoose";

export const entryValidation = {
  userId: body("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  searchTerm: body("searchTerm")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape(),

  startDate: body("startDate")
    .optional()
    .isISO8601()
    .bail()
    .escape(),

  endDate: body("endDate")
    .optional()
    .isISO8601()
    .bail()
    .escape(),

  categories: body("categories")
    .optional()
    .isArray()
    .bail()
    .custom((categories) => {
      if (!Array.isArray(categories)) return false;
      return categories.every((id) => Types.ObjectId.isValid(id));
    }),

  favorite: body("favorite")
    .optional()
    .isBoolean()
    .bail()
    .toBoolean(),

  sentimentRange: body("sentimentRange")
    .optional()
    .isObject()
    .bail()
    .custom((range) => {
      if (!range || typeof range !== "object") return false;
      const { min, max } = range;
      return (
        typeof min === "number" &&
        typeof max === "number" &&
        min >= -1 &&
        max <= 1 &&
        min <= max
      );
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