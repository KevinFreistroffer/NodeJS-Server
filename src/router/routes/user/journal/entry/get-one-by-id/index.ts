import { Router } from "express";
import { entryValidation } from "./entry.validation";
import { asyncRouteHandler } from "@/utils";
import { EntryController } from "./entry.controller";

const router = Router();

router.get(
  "/",
  entryValidation.userId,
  entryValidation.entryId,
  entryValidation.returnUser,
  asyncRouteHandler(EntryController.getOneById)
);

module.exports = router;