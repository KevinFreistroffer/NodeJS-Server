import { Router } from "express";
import { categoryValidation } from "./category.validation";
import { asyncRouteHandler } from "@/utils";
import { CategoryController } from "./category.controller";

const router = Router();

router.get(
  "/",
  categoryValidation.userId,
  categoryValidation.categoryId,
  asyncRouteHandler(CategoryController.read)
);

module.exports = router;