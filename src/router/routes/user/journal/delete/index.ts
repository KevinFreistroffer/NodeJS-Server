import { Router } from "express";
import { journalValidation } from "./journal.validation";
import { asyncRouteHandler } from "@/utils";
import { JournalController } from "./journal.controller";

const router = Router();

router.delete(
  "/",
  journalValidation.userId,
  journalValidation.journalId,
  journalValidation.returnUser,
  asyncRouteHandler(JournalController.delete)
);

module.exports = router;