import { Router } from "express";
import { LoginController } from "./login.controller";
import { loginValidation } from "./login.validation";
import { asyncRouteHandler } from "@/utils";

const router = Router();

// console.log(...Object.values(loginValidation))

router.post("/", loginValidation.usernameOrEmail, loginValidation.password, loginValidation.staySignedIn, asyncRouteHandler(LoginController.login));

module.exports = router;