import { body } from "express-validator";

export const userValidation = {
  email: body("email")
    .notEmpty()
    .bail()
    .isEmail()
    .bail()
    .normalizeEmail()
    .escape()
}; 