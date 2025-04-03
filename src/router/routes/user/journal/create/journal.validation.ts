import { body, query } from "express-validator";
import { Types } from "mongoose";
import { ICategory } from "@/defs/interfaces";

export const journalValidation = {
  userId: body("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  title: body("title")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .bail()
    .escape(),

  entry: body("entry")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1 })
    .bail()
    .escape(),

  categories: body("categories")
    .optional()
    .isArray()
    .bail()
    .custom((categories: Partial<ICategory>[]) => {
      if (!Array.isArray(categories)) {
        throw new Error("Categories must be an array");
      }
      for (const cat of categories) {
        if (!cat._id || !Types.ObjectId.isValid(cat._id)) {
          throw new Error("Invalid category ID");
        }
        if (typeof cat.category !== "string") {
          throw new Error("Category name must be a string");
        }
        if (typeof cat.selected !== "boolean") {
          throw new Error("Category selected must be a boolean");
        }
      }
      return true;
    }),

  favorite: body("favorite")
    .optional()
    .isBoolean()
    .bail()
    .toBoolean(),

  sentimentScore: body("sentimentScore")
    .optional()
    .isFloat({ min: -1, max: 1 })
    .bail()
    .toFloat(),

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