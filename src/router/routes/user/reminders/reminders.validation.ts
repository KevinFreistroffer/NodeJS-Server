import { body, query } from "express-validator";
import { Types } from "mongoose";

export const remindersValidation = {
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

  description: body("description")
    .optional()
    .isString()
    .bail()
    .trim()
    .escape(),

  dueDate: body("dueDate")
    .notEmpty()
    .bail()
    .isISO8601()
    .bail()
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
      return true;
    }),

  priority: body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  completed: body("completed")
    .optional()
    .isBoolean()
    .bail()
    .toBoolean(),

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