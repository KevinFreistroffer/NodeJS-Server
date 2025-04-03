import { Router } from "express";
import { userValidation } from "./user.validation";
import { asyncRouteHandler } from "@/utils";
import { UserController } from "./user.controller";

const router = Router();

router.delete(
  "/",
  userValidation.returnUsers,
  asyncRouteHandler(UserController.deleteAll)
);

module.exports = router;