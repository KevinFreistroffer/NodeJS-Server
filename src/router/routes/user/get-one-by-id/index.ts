import { Router } from "express";
import { userValidation } from "./user.validation";
import { asyncRouteHandler } from "@/utils";
import { UserController } from "./user.controller";

const router = Router();

router.get(
  "/:id",
  userValidation.id,
  asyncRouteHandler(UserController.getOneById)
);

module.exports = router;