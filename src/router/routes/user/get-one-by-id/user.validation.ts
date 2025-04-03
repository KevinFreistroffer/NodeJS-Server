import { param } from "express-validator";
import { Types } from "mongoose";

export const userValidation = {
  id: param("id")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape()
}; 