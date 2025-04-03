import { Router } from "express";
import { LogoutController } from "./logout.controller";

const router = Router();

router.post("/", LogoutController.logout);

module.exports = router;