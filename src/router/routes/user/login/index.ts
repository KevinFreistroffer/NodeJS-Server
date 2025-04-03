import { Router } from "express";
import { LoginController } from "./login.controller";
import { loginValidation } from "./login.validation";

const router = Router();

router.post("/", ...Object.values(loginValidation), LoginController.login);

module.exports = router;