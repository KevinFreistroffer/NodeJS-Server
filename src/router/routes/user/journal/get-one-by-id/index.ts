import { Router } from "express";
import { journalValidation } from "./journal.validation";
import { asyncRouteHandler } from "@/utils";
import { JournalController } from "./journal.controller";

const router = Router();

router.get(
  "/",
  journalValidation.userId,
  journalValidation.entryId,
  journalValidation.returnUser,
  asyncRouteHandler(JournalController.getOneById)
);

module.exports = router;