import { Router } from "express";
import { categoryValidation } from "./category.validation";
import { asyncRouteHandler } from "@/utils";
import { CategoryController } from "./category.controller";

const router = Router();

router.delete(
  "/",
  categoryValidation.userId,
  categoryValidation.categoryId,
  categoryValidation.returnUser,
  asyncRouteHandler(CategoryController.delete)
);

module.exports = router;