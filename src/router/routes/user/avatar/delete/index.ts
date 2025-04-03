import { Router } from "express";
import { avatarValidation } from "./avatar.validation";
import { asyncRouteHandler } from "@/utils";
import { AvatarController } from "./avatar.controller";

const router = Router();

router.delete(
  "/",
  avatarValidation.userId,
  avatarValidation.returnUser,
  asyncRouteHandler(AvatarController.delete)
);

module.exports = router;