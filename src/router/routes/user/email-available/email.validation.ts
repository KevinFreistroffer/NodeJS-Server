import { body } from "express-validator";

export const emailValidation = {
  email: body("email")
    .isEmail()
    .bail()
    .escape()
}; 