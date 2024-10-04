import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import { statusCodes } from "../../../defs/responses/status_codes";
import { responses as genericResponses } from "../../../defs/responses/generic";
import { findOneById } from "../../../operations/user_operations";

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
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, hasSeenHelperText } = req.body;

      if (!hasSeenHelperText) {
        res
          .status(statusCodes.missing_parameters)
          .json(genericResponses.missing_body_fields());
      }

      const doc = await findOneById(new ObjectId(userId));

      if (!doc) {
        return res
          .status(statusCodes.resource_not_found)
          .json(genericResponses.resource_not_found());
      }

      //   const user = await User.findByIdAndUpdate(userId, {
      //     hasSeenHelperText,
      //   });

      //   if (!user) {
      //     return res.status(404).json({ error: "User not found" });
      //   }

      //   // ... handle the update logic here ...

      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
module.exports = router;
