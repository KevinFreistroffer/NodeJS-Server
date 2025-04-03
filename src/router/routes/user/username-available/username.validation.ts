import { body } from "express-validator";

export const usernameValidation = {
  username: body("username")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape()
}; 