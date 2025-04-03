import { query } from "express-validator";
import { Types } from "mongoose";

export const categoryValidation = {
  userId: query("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  categoryId: query("categoryId")
    .optional()
    .custom((id) => {
      if (id && !Types.ObjectId.isValid(id)) {
        throw new Error('categoryId must be a valid ObjectId');
      }
      return true;
    })
    .escape()
}; 