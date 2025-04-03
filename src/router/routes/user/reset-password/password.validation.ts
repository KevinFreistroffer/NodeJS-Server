import { body } from "express-validator";

export const passwordValidation = {
  token: body("token")
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

  email: body("email")
    .notEmpty()
    .bail()
    .isEmail()
    .bail()
    .normalizeEmail()
}; 