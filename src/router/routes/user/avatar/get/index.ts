import { Router } from "express";
import { avatarValidation } from "./avatar.validation";
import { asyncRouteHandler } from "@/utils";
import { AvatarController } from "./avatar.controller";
const router = Router();

router.get(
  "/",
  avatarValidation.userId,
  avatarValidation.returnUser,
  asyncRouteHandler(AvatarController.get)
);

module.exports = router;