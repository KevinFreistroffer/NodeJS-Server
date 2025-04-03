import { Router } from "express";
import { entryValidation } from "./entry.validation";
import { asyncRouteHandler } from "@/utils";
import { EntryController } from "./entry.controller";

const router = Router();

router.put(
  "/",
  entryValidation.userId,
  entryValidation.entries,
  entryValidation.returnUser,
  asyncRouteHandler(EntryController.editMany)
);

module.exports = router;