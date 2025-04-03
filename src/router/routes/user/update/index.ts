import { Router } from "express";
import { userValidation } from "./user.validation";
import { asyncRouteHandler } from "@/utils";
import { UserController } from "./user.controller";

const router = Router();

router.put(
  "/",
  userValidation.userId,
  userValidation.username,
  userValidation.email,
  userValidation.firstName,
  userValidation.lastName,
  userValidation.returnUser,
  asyncRouteHandler(UserController.update)
);

module.exports = router;