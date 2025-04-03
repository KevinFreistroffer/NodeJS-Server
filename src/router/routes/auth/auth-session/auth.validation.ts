import { header } from "express-validator";

export const authValidation = {
  authorization: header("authorization")
    .optional()
    .isString()
    .bail()
    .custom((value) => {
      if (value && !value.toLowerCase().startsWith("bearer ")) {
        throw new Error("Authorization header must start with 'Bearer '");
      }
      return true;
    })
}; 