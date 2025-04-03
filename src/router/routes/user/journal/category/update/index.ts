import { Router } from "express";
import { categoryValidation } from "./category.validation";
import { asyncRouteHandler } from "@/utils";
import { CategoryController } from "./category.controller";

const router = Router();

router.put(
  "/",
  categoryValidation.userId,
  categoryValidation.categoryId,
  categoryValidation.category,
  categoryValidation.returnUser,
  asyncRouteHandler(CategoryController.update)
);

module.exports = router;