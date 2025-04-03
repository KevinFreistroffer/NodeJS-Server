import { body, query } from "express-validator";
import { Types } from "mongoose";

export const entryValidation = {
  userId: body("userId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  entryId: body("entryId")
    .notEmpty()
    .bail()
    .custom((id) => Types.ObjectId.isValid(id))
    .bail()
    .escape(),

  sentimentScore: body("sentimentScore")
    .notEmpty()
    .bail()
    .isNumeric()
    .bail()
    .custom((score) => {
      const num = parseFloat(score);
      if (num < -1 || num > 1) {
        throw new Error("Sentiment score must be between -1 and 1");
      }
      return true;
    })
    .bail()
    .toFloat(),

  returnUser: query("returnUser")
    .optional()
    .isString()
    .bail()
    .custom((value) => {
      if (value && !["true", "false"].includes(value.toLowerCase())) {
        throw new Error('returnUser must be "true" or "false" (case insensitive)');
      }
      return true;
    })
}; 