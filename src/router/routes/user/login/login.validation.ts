import { body } from "express-validator";

export const loginValidation = {
  usernameOrEmail: body("usernameOrEmail")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape(),

  password: body("password")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape(),

  staySignedIn: body("staySignedIn")
    .optional()
    .isBoolean()
    .bail()
    .escape()
}; 