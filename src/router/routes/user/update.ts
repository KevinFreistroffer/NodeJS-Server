import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { statusCodes } from "../../../defs/responses/status_codes";
import { responses as genericResponses } from "../../../defs/responses/generic";
import { findOneById, updateOne } from "../../../operations/user_operations";
import { handleCaughtErrorResponse } from "../../../utils";
import { responses as userResponses } from "../../../defs/responses/user";
const router = Router();

const validatedUserId = body("userId")
  .isMongoId()
  .withMessage("Invalid userId format");
const validatedUpdateFields = body("hasSeenHelperText")
  .optional()
  .isBoolean()
  .withMessage("hasSeenHelperText must be a boolean");

router.post(
  "/",
  validatedUserId,
  validatedUpdateFields,
  async (req: Request, res: Response) => {
    try {
      console.log("/user/update", req.body);
      const errors = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()) {
        console.log("!errors.isEmpty()", !errors.isEmpty());
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, hasAcknowledgedHelperText } = req.body;

      const doc = await findOneById(new ObjectId(userId));
      console.log("doc", doc);
      if (!doc) {
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found());
      }

      const updateResult = await updateOne(
        { _id: doc._id },
        { $set: { hasAcknowledgedHelperText } }
      );

      console.log("updateResult", updateResult);

      if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
        return res.json(userResponses.could_not_update());
      }

      return res.json(genericResponses.success());
    } catch (error) {
      console.log(error);
      return handleCaughtErrorResponse(error, req, res);
    }
  }
);
module.exports = router;
