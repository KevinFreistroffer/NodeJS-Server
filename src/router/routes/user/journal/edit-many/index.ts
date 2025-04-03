import { Router } from "express";
import { journalValidation } from "./journal.validation";
import { asyncRouteHandler } from "@/utils";
import { JournalController } from "./journal.controller";

const router = Router();

router.put(
  "/",
  journalValidation.userId,
  journalValidation.entries,
  journalValidation["entries.*.entryId"],
  journalValidation["entries.*.title"],
  journalValidation["entries.*.entry"],
  journalValidation["entries.*.categories"],
  journalValidation["entries.*.categories.*._id"],
  journalValidation["entries.*.categories.*.category"],
  journalValidation["entries.*.categories.*.selected"],
  journalValidation["entries.*.favorite"],
  journalValidation["entries.*.sentimentScore"],
  journalValidation.returnUser,
  asyncRouteHandler(JournalController.editMany)
);

module.exports = router;