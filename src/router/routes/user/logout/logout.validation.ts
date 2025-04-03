import { header } from "express-validator";

export const logoutValidation = {
  authorization: header("Authorization")
    .notEmpty()
    .withMessage("Authorization header is required")
    .bail()
    .custom((value) => {
      if (!value.startsWith("Bearer ")) {
        throw new Error("Authorization header must start with 'Bearer '");
      }
      return true;
    })
    .bail()
    .custom((value) => {
      const token = value.split(" ")[1];
      if (!token || token.length < 10) {
        throw new Error("Invalid token format");
      }
      return true;
    })
    .escape()
}; 