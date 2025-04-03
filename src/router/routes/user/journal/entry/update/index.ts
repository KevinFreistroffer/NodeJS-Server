import { Router } from "express";
import { entryValidation } from "./entry.validation";
import { asyncRouteHandler } from "@/utils";
import { EntryController } from "./entry.controller";

const router = Router();

router.put(
  "/",
  entryValidation.userId,
  entryValidation.entryId,
  entryValidation.title,
  entryValidation.entry,
  entryValidation.categories,
  entryValidation.favorite,
  entryValidation.sentimentScore,
  entryValidation.returnUser,
  asyncRouteHandler(EntryController.update)
);

module.exports = router;