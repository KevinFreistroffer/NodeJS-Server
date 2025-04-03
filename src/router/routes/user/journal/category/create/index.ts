import { Router } from "express";
import { categoryValidation } from "./category.validation";
import { asyncRouteHandler } from "@/utils";
import { CategoryController } from "./category.controller";

const router = Router();

router.post(
  "/",
  categoryValidation.userId,
  categoryValidation.category,
  categoryValidation.returnUser,
  asyncRouteHandler(CategoryController.create)
);

export default router;