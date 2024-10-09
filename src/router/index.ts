"use strict";

import express, { Router } from "express";

module.exports = (app: express.Express) => {
  app.use(
    "/auth/send-verification-email",
    require("./routes/auth/send-verification-email")
  );
  app.use("/auth/bearer", require("./routes/auth/bearer"));
  app.use("/auth/verify-account", require("./routes/auth/verify-account"));
  app.use("/auth/authenticate", require("./routes/auth/authenticate"));
  // app.use("/auth/public-key", require("./routes/auth/public-key"));
  app.use("/user", require("./routes/user/get-by-id"));
  app.use("/user/create", require("./routes/user/create"));
  app.use("/user/login", require("./routes/user/login"));
  app.use(
    "/user/send-reset-password-email",
    require("./routes/user/send-reset-password-email")
  );
  app.use("/user/reset-password", require("./routes/user/reset-password"));
  app.use("/user/email-available", require("./routes/user/email-available"));
  app.use(
    "/user/username-available",
    require("./routes/user/username-available")
  );

  app.use("/user/users", require("./routes/user/users"));
  app.use("/user/update", require("./routes/user/update"));

  app.use("/user/delete-all", require("./routes/user/delete-all"));
  app.use("/user/entry/create", require("./routes/user/entry/create"));
  app.use("/user/entry/edit", require("./routes/user/entry/edit"));
  app.use("/user/entry/edit-many", require("./routes/user/entry/edit-many"));
  app.use("/user/entry/entries", require("./routes/user/entry/entries"));
  app.use("/user/entry/delete", require("./routes/user/entry/delete"));

  app.use(
    "/user/entry/category/create",
    require("./routes/user/entry/category/create")
  );
  app.use(
    "/user/entry/category/edit",
    require("./routes/user/entry/category/edit")
  );
  app.use(
    "/user/entry/category/delete",
    require("./routes/user/entry/category/delete")
  );
  app.use(
    "/user/entry/category/create-many",
    require("./routes/user/entry/category/create-many")
  );
  app.use("/streams/file", require("./routes/streams/file"));

  //These routes are not implemented yet
  // app.use(
  //   "/entry/deleteSelectedEntries",
  //   require("./routes/entry/deleteSelectedEntries")
  // );
  // app.use(
  //   "/entry/deleteSelectedCategories",
  //   require("./routes/entry/deleteSelectedCategories")
  // );
  // app.use(
  //   "/entry/updateEntryCategories",
  //   require("./routes/entry/updateEntryCategories")
  // );
};
