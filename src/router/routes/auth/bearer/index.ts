import { Router } from "express";
import { bearerValidation } from "./bearer.validation";
import { asyncRouteHandler } from "@/utils";
import { BearerController } from "./bearer.controller";

const router = Router();

router.get(
  "/",
  bearerValidation.authorization,
  asyncRouteHandler(BearerController.verify)
);

module.exports = router;