import { Router } from "express";
import { LogoutController } from "./logout.controller";
import { logoutValidation } from "./logout.validation";
import { asyncRouteHandler } from "@/utils";

const router = Router();

router.post("/", logoutValidation.authorization, asyncRouteHandler(LogoutController.logout));

module.exports = router;