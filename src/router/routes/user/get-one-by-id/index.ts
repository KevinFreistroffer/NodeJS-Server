import { Router } from "express";
import { userValidation } from "./user.validation";
import { asyncRouteHandler } from "@/utils";
import { UserController } from "./user.controller";
import { cacheMiddleware } from "@/redis/cacheMiddleware";
const router = Router();

router.get(
  "/:id",
  userValidation.id,
  cacheMiddleware(60), // 1 minute because i imagine someone may make journals often. Would want them to get live updates.
  asyncRouteHandler(UserController.getOneById)
);

module.exports = router;