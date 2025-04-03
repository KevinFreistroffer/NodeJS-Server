import { body } from "express-validator";

export const authValidation = {
  usernameOrEmail: body("usernameOrEmail")
    .notEmpty()
    .withMessage("Username or email is required")
    .bail()
    .isString()
    .withMessage("Username or email must be a string")
    .bail()
    .escape(),

  password: body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .bail()
    .escape(),
}; 