import { body } from "express-validator";

export const userValidation = {
  username: body("username")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .bail()
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .escape(),

  email: body("email")
    .notEmpty()
    .bail()
    .isEmail()
    .bail()
    .normalizeEmail()
    .escape(),

  password: body("password")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .escape(),

  // firstName: body("firstName")
  //   .notEmpty()
  //   .bail()
  //   .isString()
  //   .bail()
  //   .trim()
  //   .isLength({ min: 2, max: 50 })
  //   .bail()
  //   .matches(/^[a-zA-Z\s-]+$/)
  //   .withMessage("First name can only contain letters, spaces, and hyphens")
  //   .escape(),

  // lastName: body("lastName")
  //   .notEmpty()
  //   .bail()
  //   .isString()
  //   .bail()
  //   .trim()
  //   .isLength({ min: 2, max: 50 })
  //   .bail()
  //   .matches(/^[a-zA-Z\s-]+$/)
  //   .withMessage("Last name can only contain letters, spaces, and hyphens")
  //   .escape()
}; 