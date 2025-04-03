import { body, query } from "express-validator";
import { Types } from "mongoose";

export const userValidation = {
  userId: body("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  username: body("username")
    .optional()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .bail()
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .escape(),

  email: body("email")
    .optional()
    .isEmail()
    .bail()
    .normalizeEmail()
    .escape(),

  firstName: body("firstName")
    .optional()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .bail()
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage("First name can only contain letters, spaces, and hyphens")
    .escape(),

  lastName: body("lastName")
    .optional()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .bail()
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage("Last name can only contain letters, spaces, and hyphens")
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