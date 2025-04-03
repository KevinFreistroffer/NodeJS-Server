import { Router } from "express";
import { entryValidation } from "./entry.validation";
import { asyncRouteHandler } from "@/utils/async_route_handler";
import { EntryController } from "./entry.controller";

const router = Router();

router.get(
  "/",
  entryValidation,
  asyncRouteHandler(EntryController.getOneById)
);

module.exports = router;