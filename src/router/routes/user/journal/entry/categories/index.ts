import { Router } from "express";
import { entryValidation } from "./entry.validation";
import { asyncRouteHandler } from "@/utils";
import { EntryController } from "./entry.controller";

const router = Router();

router.put(
  "/",
  entryValidation.userId,
  entryValidation.entryId,
  entryValidation.categories,
  entryValidation.returnUser,
  asyncRouteHandler(EntryController.categories)
);

module.exports = router;