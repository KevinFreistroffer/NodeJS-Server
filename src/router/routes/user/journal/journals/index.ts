import { Router } from "express";
import { journalsValidation } from "./journals.validation";
import { asyncRouteHandler } from "@/utils";
import { JournalsController } from "./journals.controller";

const router = Router();

router.get(
  "/",
  journalsValidation.userId,
  journalsValidation.returnUser,
  asyncRouteHandler(JournalsController.getAll)
);

module.exports = router;
