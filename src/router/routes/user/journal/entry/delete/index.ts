import { Router } from "express";
import { entryValidation } from "./entry.validation";
import { asyncRouteHandler } from "@/utils";
import { EntryController } from "./entry.controller";

const router = Router();

router.delete(
  "/",
  entryValidation.userId,
  entryValidation.entryId,
  entryValidation.returnUser,
  asyncRouteHandler(EntryController.delete)
);

module.exports = router;