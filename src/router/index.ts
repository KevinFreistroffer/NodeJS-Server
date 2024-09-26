"use strict";

import express, { Router } from "express";

module.exports = (app: express.Express) => {
  app.use("/auth/bearer", require("./routes/auth/bearer"));
  app.use("/auth/verify-account", require("./routes/auth/verify-account"));
  app.use("/auth/authenticate", require("./routes/auth/authenticate"));
  // app.use("/auth/public-key", require("./routes/auth/public-key"));
  app.use("/user/create", require("./routes/user/create"));
  app.use("/user/login", require("./routes/user/login"));
  app.use("/user/forgot-password", require("./routes/user/forgot-password"));
  app.use("/user/reset-password", require("./routes/user/reset-password"));
  app.use("/user/email-available", require("./routes/user/email-available"));
  app.use(
    "/user/username-available",
    require("./routes/user/username-available")
  );

  app.use("/user/users", require("./routes/user/users"));
  app.use("/user", require("./routes/user/get-by-id"));
  app.use("/user/delete-all", require("./routes/user/delete-all"));
  app.use("/user/journal/create", require("./routes/user/journal/create"));
  app.use("/user/journal/edit", require("./routes/user/journal/edit"));
  app.use("/user/journal/journals", require("./routes/user/journal/journals"));
  app.use("/user/journal/delete", require("./routes/user/journal/delete"));
  app.use(
    "/user/journal/category/create",
    require("./routes/user/journal/category/create")
  );
  app.use(
    "/user/journal/category/edit",
    require("./routes/user/journal/category/edit")
  );
  app.use(
    "/user/journal/category/delete",
    require("./routes/user/journal/category/delete")
  );
  app.use(
    "/user/journal/category/create-many",
    require("./routes/user/journal/category/create-many")
  );
  app.use("/streams/file", require("./routes/streams/file"));

  //These routes are not implemented yet
  // app.use(
  //   "/journal/deleteSelectedJournals",
  //   require("./routes/journal/deleteSelectedJournals")
  // );
  // app.use(
  //   "/journal/deleteSelectedCategories",
  //   require("./routes/journal/deleteSelectedCategories")
  // );
  // app.use(
  //   "/journal/updateJournalCategories",
  //   require("./routes/journal/updateJournalCategories")
  // );
};
