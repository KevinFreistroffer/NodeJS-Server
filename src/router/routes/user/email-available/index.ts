import { Router } from "express";
import { emailValidation } from "./email.validation";
import { asyncRouteHandler } from "@/utils";
import { EmailController } from "./email.controller";

const router = Router();

router.post(
  "/",
  emailValidation.email,
  asyncRouteHandler(EmailController.checkAvailability)
);

module.exports = router;