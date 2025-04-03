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

  entries: body("entries")
    .notEmpty()
    .bail()
    .isArray()
    .bail()
    .custom((entries) => {
      if (!Array.isArray(entries)) return false;
      return entries.every((entry) => {
        return (
          Types.ObjectId.isValid(entry.entryId) &&
          (entry.title === undefined || typeof entry.title === "string") &&
          (entry.entry === undefined || typeof entry.entry === "string") &&
          (entry.categories === undefined ||
            (Array.isArray(entry.categories) &&
              entry.categories.every((cat: Partial<ICategory>) =>
                Types.ObjectId.isValid(cat._id) &&
                typeof cat.category === "string" &&
                typeof cat.selected === "boolean"
              ))) &&
          (entry.favorite === undefined || typeof entry.favorite === "boolean") &&
          (entry.sentimentScore === undefined ||
            (typeof entry.sentimentScore === "number" &&
              entry.sentimentScore >= -1 &&
              entry.sentimentScore <= 1))
        );
      });
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