import { Router } from "express";
import { userValidation } from "./user.validation";
import { asyncRouteHandler } from "@/utils";
import { UserController } from "./user.controller";

const router = Router();

router.post(
  "/",
  ...Object.values(userValidation),
  asyncRouteHandler(UserController.create)
);

module.exports = router;