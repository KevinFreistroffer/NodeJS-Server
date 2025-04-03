import { Router } from "express";
import { emailValidation } from "./email.validation";
import { asyncRouteHandler } from "@/utils";
import { EmailController } from "./email.controller";
import { cacheMiddleware } from "@/redis/cacheMiddleware";
const router = Router();

router.post(
  "/",
  emailValidation.email,
  /**
   * This API endpoint gets called to verify if an email is available. Someone    
   */
  cacheMiddleware(300),
  asyncRouteHandler(EmailController.checkAvailability)
);

module.exports = router;