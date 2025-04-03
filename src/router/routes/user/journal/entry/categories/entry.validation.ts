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

  entryId: body("entryId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  categories: body("categories")
    .notEmpty()
    .bail()
    .isArray()
    .bail()
    .custom((categories: Partial<ICategory>[]) => {
      if (!Array.isArray(categories)) return false;
      return categories.every((cat) => {
        return (
          cat._id && Types.ObjectId.isValid(cat._id) &&
          typeof cat.category === "string" &&
          typeof cat.selected === "boolean"
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