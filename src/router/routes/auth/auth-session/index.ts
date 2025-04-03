import { Router } from "express";
import { authValidation } from "./auth.validation";
import { asyncRouteHandler } from "@/utils";
import { AuthController } from "./auth.controller";

const router = Router();

router.get(
  "/",
  authValidation.authorization,
  asyncRouteHandler(AuthController.checkSession)
);

module.exports = router;