import { Router } from "express";
import { journalValidation } from "./journal.validation";
import { asyncRouteHandler } from "@/utils";
import { JournalController } from "./journal.controller";

const router = Router();

router.post(
  "/",
  journalValidation.userId,
  journalValidation.title,
  journalValidation.entry,
  journalValidation.categories,
  journalValidation.favorite,
  journalValidation.sentimentScore,
  journalValidation.returnUser,
  asyncRouteHandler(JournalController.create)
);

module.exports = router;
