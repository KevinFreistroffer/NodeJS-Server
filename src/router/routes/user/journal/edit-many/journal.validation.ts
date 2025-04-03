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

  entries: body("entries")
    .notEmpty()
    .bail()
    .isArray()
    .bail()
    .custom((entries) => {
      if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error("Entries must be a non-empty array");
      }
      return true;
    }),

  "entries.*.entryId": body("entries.*.entryId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  "entries.*.title": body("entries.*.title")
    .optional()
    .isString()
    .bail()
    .custom((title) => typeof title === "string")
    .escape(),

  "entries.*.entry": body("entries.*.entry")
    .optional()
    .isString()
    .bail()
    .custom((entry) => typeof entry === "string")
    .escape(),

  "entries.*.categories": body("entries.*.categories")
    .optional()
    .isArray()
    .bail()
    .custom((categories) => {
      if (!Array.isArray(categories)) {
        throw new Error("Categories must be an array");
      }
      return true;
    }),

  "entries.*.categories.*._id": body("entries.*.categories.*._id")
    .optional()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  "entries.*.categories.*.category": body("entries.*.categories.*.category")
    .optional()
    .isString()
    .bail()
    .custom((category) => typeof category === "string")
    .escape(),

  "entries.*.categories.*.selected": body("entries.*.categories.*.selected")
    .optional()
    .isBoolean()
    .bail()
    .custom((selected) => typeof selected === "boolean"),

  "entries.*.favorite": body("entries.*.favorite")
    .optional()
    .isBoolean()
    .bail()
    .custom((favorite) => typeof favorite === "boolean"),

  "entries.*.sentimentScore": body("entries.*.sentimentScore")
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