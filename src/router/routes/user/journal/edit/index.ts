import { Router } from "express";
import { journalValidation } from "./journal.validation";
import { asyncRouteHandler } from "@/utils";
import { JournalController } from "./journal.controller";

const router = Router();

router.put(
  "/",
  journalValidation.userId,
  journalValidation.entryId,
  journalValidation.title,
  journalValidation.entry,
  journalValidation.categories,
  journalValidation["categories.*._id"],
  journalValidation["categories.*.category"],
  journalValidation["categories.*.selected"],
  journalValidation.favorite,
  journalValidation.sentimentScore,
  journalValidation.returnUser,
  asyncRouteHandler(JournalController.edit)
);

module.exports = router;