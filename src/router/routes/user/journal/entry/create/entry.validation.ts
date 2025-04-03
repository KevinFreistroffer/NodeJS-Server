import { body, query } from "express-validator";
import { Types } from "mongoose";
import { ICategory } from "@/defs/interfaces";

export const entryValidation = {
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
    .escape(),

  entry: body("entry")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape(),

  categories: body("categories")
    .optional()
    .isArray()
    .bail()
    .custom((categories) => {
      if (categories && !Array.isArray(categories)) {
        throw new Error("Categories must be an array");
      }
      if (categories) {
        const validCategories = categories.every((cat: Partial<ICategory>) =>
          typeof cat === "object" &&
          cat !== null &&
          Types.ObjectId.isValid(cat._id?.toString() || "") &&
          typeof cat.category === "string" &&
          typeof cat.selected === "boolean"
        );
        if (!validCategories) {
          throw new Error("Invalid category format");
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
    .isNumeric()
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