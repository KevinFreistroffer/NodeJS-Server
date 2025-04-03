import { body } from "express-validator";

export const emailValidation = {
  email: body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email format")
    .bail()
    .normalizeEmail()
    .escape(),
}; 