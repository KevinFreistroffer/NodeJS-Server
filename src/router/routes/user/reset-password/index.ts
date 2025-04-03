import { Router } from "express";
import { passwordValidation } from "./password.validation";
import { asyncRouteHandler } from "@/utils";
import { PasswordController } from "./password.controller";

const router = Router();

router.post(
  "/",
  passwordValidation.token,
  passwordValidation.password,
  passwordValidation.email,
  asyncRouteHandler(PasswordController.reset)
);

module.exports = router;