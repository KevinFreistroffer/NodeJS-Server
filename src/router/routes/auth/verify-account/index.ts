import { Router } from "express";
import { verifyValidation } from "./verify.validation";
import { asyncRouteHandler } from "@/utils";
import { VerifyController } from "./verify.controller";

const router = Router();

router.post(
  "/",
  verifyValidation.token,
  asyncRouteHandler(VerifyController.verifyAccount)
);

module.exports = router;