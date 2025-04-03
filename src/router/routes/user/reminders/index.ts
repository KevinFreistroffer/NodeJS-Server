import { Router } from "express";
import { RemindersController } from "./reminders.controller";
import { remindersValidation } from "./reminders.validation";
import { asyncRouteHandler } from "@/utils";

const router = Router();

router.post(
  "/",
  ...Object.values(remindersValidation),
  asyncRouteHandler(RemindersController.create)
);

module.exports = router;
