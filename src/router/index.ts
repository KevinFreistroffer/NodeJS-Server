"use strict";

import express, { Router } from "express";

module.exports = (app: express.Express) => {
  app.use(
    "/auth/send-verification-email",
    require("./routes/auth/send-verification-email/index")
  );
  app.use("/auth/bearer", require("./routes/auth/bearer/index"));
  app.use("/auth/verify-account", require("./routes/auth/verify-account/index"));
  // app.use("/auth/authenticate", require("./routes/auth/authenticate/index"));
  // // app.use("/auth/public-key", require("./routes/auth/public-key"));

  // app.use("/user/create", require("./routes/user/create/index"));
  // app.use("/user/login", require("./routes/user/login/index"));
  // app.use(
  //   "/user/send-reset-password-email",
  //   require("./routes/user/send-reset-password-email/index")
  // );
  // app.use("/user/reset-password", require("./routes/user/reset-password/index"));
  // app.use("/user/email-available", require("./routes/user/email-available/index"));
  // app.use(
  //   "/user/username-available",
  //   require("./routes/user/username-available/index")
  // );
  // app.use("/user", require("./routes/user/get-one-by-id/index"));
  // app.use("/fake/login", require("./routes/fake/login"));
  // app.use("/fake/auth", require("./routes/fake/auth"));
  // app.use("/user/users", require("./routes/user/users/index"));
  // app.use("/user/update", require("./routes/user/update/index"));
  // app.use("/user/avatar/upload", require("./routes/user/avatar/upload/index"));
  // app.use("/user/avatar/delete", require("./routes/user/avatar/delete/index"));
  // app.use("/user/delete-all", require("./routes/user/delete-all/index"));
  // app.use("/user/journal/create", require("./routes/user/journal/create/index"));
  // app.use("/user/journal/edit", require("./routes/user/journal/edit/index"));
  // app.use(
  //   "/user/journal/edit-many",
  //   require("./routes/user/journal/edit-many/index")
  // );
  // app.use("/user/journal/journals", require("./routes/user/journal/journals/index"));
  // app.use("/user/journal/delete", require("./routes/user/journal/delete/index"));
  // app.use("/user/journal", require("./routes/user/journal/get-one-by-id/index"));
  // app.use(
  //   "/user/journal/category/create",
  //   require("./routes/user/journal/category/create/index")
  // );
  // app.use(
  //   "/user/journal/category/edit",
  //   require("./routes/user/journal/category/edit/index")
  // );
  // app.use(
  //   "/user/journal/category/delete",
  //   require("./routes/user/journal/category/delete/index")
  // );
  // app.use(
  //   "/user/journal/category/create-many",
  //   require("./routes/user/journal/category/create-many/index")
  // );
  // app.use("/user/reminders", require("./routes/user/reminders/index"));
  // app.use("/streams/file", require("./routes/streams/file/index"));
  // app.use("/x", require("./routes/x"));
  // app.use("/x/callback", require("./routes/x/callback"));
  // app.use("/x/login", require("./routes/x/login"));
  // app.use("/x/revoke", require("./routes/x/revoke"));
  // app.use("/x/tweets", require("./routes/x/tweets"));
  // app.use(
  //   "/x/request-access-token",
  //   require("./routes/x/request-access-token")
  // );
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
