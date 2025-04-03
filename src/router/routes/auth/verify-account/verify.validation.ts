import { body } from "express-validator";

export const verifyValidation = {
  token: body("token")
    .notEmpty()
    .withMessage("Verification token is required")
    .bail()
    .isString()
    .withMessage("Token must be a string")
    .bail()
    .isLength({ min: 10 })
    .withMessage("Invalid token format")
    .escape(),
}; 