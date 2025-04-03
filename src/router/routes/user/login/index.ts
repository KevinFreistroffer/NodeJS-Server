import { Router } from "express";
import { LoginController } from "./login.controller";
import { loginValidation } from "./login.validation";
import { asyncRouteHandler } from "@/utils";

const router = Router();

router.post("/", ...Object.values(loginValidation), asyncRouteHandler(LoginController.login));

module.exports = router;