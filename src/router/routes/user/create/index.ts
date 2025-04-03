import { Router } from "express";
import { userValidation } from "./user.validation";
import { asyncRouteHandler } from "@/utils";
import { UserController } from "./user.controller";

const router = Router();

router.post(
  "/",
  userValidation.username,
  userValidation.email,
  userValidation.password,
  userValidation.firstName,
  userValidation.lastName,
  asyncRouteHandler(UserController.create)
);

module.exports = router;