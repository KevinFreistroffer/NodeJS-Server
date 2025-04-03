import { body } from "express-validator";

export const authValidation = {
  usernameOrEmail: body("usernameOrEmail")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .custom((value) => typeof value === "string")
    .escape(),

  password: body("password")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .custom((value) => typeof value === "string")
    .escape(),

  returnUser: body("returnUser")
    .optional()
    .isBoolean()
    .bail()
    .custom((value) => typeof value === "boolean")
}; 