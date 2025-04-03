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

  entryId: body("entryId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  title: body("title")
    .optional()
    .isString()
    .bail()
    .custom((title) => typeof title === "string")
    .escape(),

  entry: body("entry")
    .optional()
    .isString()
    .bail()
    .custom((entry) => typeof entry === "string")
    .escape(),

  categories: body("categories")
    .optional()
    .isArray()
    .bail()
    .custom((categories) => {
      if (!Array.isArray(categories)) {
        throw new Error("Categories must be an array");
      }
      return true;
    }),

  "categories.*._id": body("categories.*._id")
    .optional()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  "categories.*.category": body("categories.*.category")
    .optional()
    .isString()
    .bail()
    .custom((category) => typeof category === "string")
    .escape(),

  "categories.*.selected": body("categories.*.selected")
    .optional()
    .isBoolean()
    .bail()
    .custom((selected) => typeof selected === "boolean"),

  favorite: body("favorite")
    .optional()
    .isBoolean()
    .bail()
    .custom((favorite) => typeof favorite === "boolean"),

  sentimentScore: body("sentimentScore")
    .optional()
    .isNumeric()
    .bail()
    .custom((score) => {
      const num = Number(score);
      if (num < -1 || num > 1) {
        throw new Error("Sentiment score must be between -1 and 1");
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