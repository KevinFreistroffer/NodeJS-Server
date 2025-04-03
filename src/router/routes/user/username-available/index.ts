import { Router } from "express";
import { usernameValidation } from "./username.validation";
import { asyncRouteHandler } from "@/utils";
import { UsernameController } from "./username.controller";

const router = Router();

router.post(
  "/",
  usernameValidation.username,
  asyncRouteHandler(UsernameController.checkAvailability)
);

module.exports = router;