import { Router } from "express";
import { categoryValidation } from "./category.validation";
import { asyncRouteHandler } from "@/utils";
import { CategoryController } from "./category.controller";

const router = Router();

router.post(
  "/",
  categoryValidation.userId,
  categoryValidation.categoryId,
  categoryValidation.category,
  categoryValidation.returnUser,
  asyncRouteHandler(CategoryController.edit)
);

module.exports = router;