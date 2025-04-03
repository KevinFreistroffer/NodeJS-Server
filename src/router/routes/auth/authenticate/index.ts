import { Router } from "express";
import { authValidation } from "./auth.validation";
import { asyncRouteHandler } from "@/utils";
import { AuthController } from "./auth.controller";

const router = Router();

router.post(
  "/",
  authValidation.usernameOrEmail,
  authValidation.password,
  asyncRouteHandler(AuthController.authenticate)
);

module.exports = router;