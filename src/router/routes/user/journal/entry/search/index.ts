import { Router } from "express";
import { entryValidation } from "./entry.validation";
import { asyncRouteHandler } from "@/utils";
import { EntryController } from "./entry.controller";

const router = Router();

router.post(
  "/",
  entryValidation.userId,
  entryValidation.searchTerm,
  entryValidation.startDate,
  entryValidation.endDate,
  entryValidation.categories,
  entryValidation.favorite,
  entryValidation.sentimentRange,
  entryValidation.returnUser,
  asyncRouteHandler(EntryController.search)
);

module.exports = router;