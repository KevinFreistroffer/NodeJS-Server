import { Router } from "express";
import { avatarValidation } from "./avatar.validation";
import { asyncRouteHandler } from "@/utils";
import { AvatarController } from "./avatar.controller";

const router = Router();

router.post(
  "/",
  avatarValidation.userId,
  avatarValidation.data,
  avatarValidation.returnUser,
  asyncRouteHandler(AvatarController.upload)
);

module.exports = router;