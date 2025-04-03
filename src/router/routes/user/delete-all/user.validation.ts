import { query } from "express-validator";

export const userValidation = {
  returnUsers: query("returnUsers")
    .optional()
    .isString()
    .bail()
    .custom((value) => {
      if (value && !["true", "false"].includes(value.toLowerCase())) {
        throw new Error('returnUsers must be "true" or "false" (case insensitive)');
      }
      return true;
    })
}; 