import express from "express";
import request from "supertest";
import { verifyToken } from "../src/middleware";
import { getBearerToken } from "../src/test-utils";
import { ObjectId } from "mongodb";
import {
  findOneByEmail,
  findOneByUsername,
  updateOne,
  findOneById,
  insertOne,
  findOneByUsernameOrEmail,
  findAllUsers,
} from "../src/operations/user_operations";
import { responses } from "../src/defs/responses/user";
import { mockJournal } from "../__mocks__/mock_journals";
import { mockUser, mockUsersWithJournals } from "../__mocks__/mock_users";
import dotenv from "dotenv";

dotenv.config();

jest.mock("../src/operations/user_operations", () => ({
  findOneById: jest.fn(),
  findOneByUsername: jest.fn(),
  findOneByEmail: jest.fn(),
  findOneByUsernameOrEmail: jest.fn(),
  findAllUsers: jest.fn(),
  createJournal: jest.fn(),
  findAllJournals: jest.fn(),
  deleteJournal: jest.fn(),
  deleteSelectedJournals: jest.fn(),
  deleteSelectedCategories: jest.fn(),
  updateJournalCategories: jest.fn(),
  addCategory: jest.fn(),
  updateOne: jest.fn(),
  insertOne: jest.fn(),
}));

jest.mock("../src/middleware", () => ({
  verifyToken: jest.fn((req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log("authHeader", authHeader);
    console.log("process.env.TEST_TOKEN", process.env.TEST_TOKEN);
    if (authHeader === `Bearer ${process.env.TEST_TOKEN}`) {
      next();
    } else {
      res.sendStatus(401);
    }
  }),
}));

const app = express();
const usersRoute = require("../src/router/routes/user/users");
const createRoute = require("../src/router/routes/user/create");
const usernameAvailableRoute = require("../src/router/routes/user/username-available");
const emailAvailableRoute = require("../src/router/routes/user/email-available");
const authBearerRoute = require("../src/router/routes/auth/bearer");
const journalCreateRoute = require("../src/router/routes/user/journal/create");
const journalCreateCategoryRoute = require("../src/router/routes/user/journal/category/create");
const journalEditRoute = require("../src/router/routes/user/journal/edit");
const journalJournalsRoute = require("../src/router/routes/user/journal/journals");
const journalDeleteRoute = require("../src/router/routes/user/journal/delete");
const journalCategoryEditRoute = require("../src/router/routes/user/journal/category/edit");
const journalCategoryDeleteRoute = require("../src/router/routes/user/journal/category/delete");
const createManyJournalCategoryRoute = require("../src/router/routes/user/journal/category/create-many");
// const journalDeleteSelectedJournalsRoute = require("../src/router/routes/user/journal/deleteSelectedJournals");
// const journalDeleteSelectedCategoriesRoute = require("../src/router/routes/user/journal/deleteSelectedCategories");
// const journalUpdateJournalCategoriesRoute = require("../src/router/routes/user/journal/updateJournalCategories");

const userId = "66c1fabdebae7aad2803ef28";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(verifyToken);
app.use("/user/users", usersRoute);
app.use("/user/create", createRoute);
app.use("/user/username-available", usernameAvailableRoute);
app.use("/user/email-available", emailAvailableRoute);
app.use("/auth/bearer", authBearerRoute);
app.use("/user/journal/create", journalCreateRoute);
app.use("/user/journal/category/create", journalCreateCategoryRoute);
app.use("/user/journal/edit", journalEditRoute);
app.use(`/user/journal/journals`, journalJournalsRoute);
app.use("/user/journal/delete", journalDeleteRoute);
app.use("/user/journal/category/create-many", createManyJournalCategoryRoute);
app.use("/user/journal/category/delete", journalCategoryDeleteRoute);
app.use("/user/journal/category/edit", journalCategoryEditRoute);
// app.use(
//   "/user/journal/deleteSelectedJournals",
//   journalDeleteSelectedJournalsRoute
// );
// app.use(
//   "/user/journal/deleteSelectedCategories",
//   journalDeleteSelectedCategoriesRoute
// );
// app.use(
//   "/user/journal/updateJournalCategories",
//   journalUpdateJournalCategoriesRoute
// );

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * /user/users
 */
describe("Protected Routes - /user/users", () => {
  (findAllUsers as jest.Mock).mockResolvedValue(mockUsersWithJournals);
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).get("/user/users");
    expect(response.status).toBe(401);
  });
  it("should allow access with a valid token", async () => {
    const response = await request(app)
      .get("/user/users")
      .set("Authorization", getBearerToken());
    // expect(verifyToken).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});

/**
 * /user/username-available
 */
describe("Protected Routes - /user/username-available", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    (findOneByUsername as jest.Mock).mockResolvedValue(mockUser);
    const response = await request(app)
      .post("/user/username-available")
      .send({ username: "newuser" })
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });
  it("should allow access with a valid token", async () => {
    (findOneByUsername as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/user/username-available")
      .send({ username: "newuser" })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /user/email-available
 */
describe("Protected Routes - /user/email-available", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    (findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
    const response = await request(app)
      .post("/user/email-available")
      .send({ email: "newuser" })
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });
  it("should allow access with a valid token", async () => {
    (findOneByEmail as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/user/email-available")
      .send({ email: "newuser@example.com" })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /journal/create
 */
describe("Protected Routes - /journal/create", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .post("/user/journal/create")
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    const response = await request(app)
      .post("/user/journal/create")
      .send({
        userId: new ObjectId(),
        title: "Test Journal",
        entry: "Test Entry",
        category: "Test Category",
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /journal/edit
 */
describe("Protected Routes - /journal/edit", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    (updateOne as jest.Mock).mockResolvedValue({
      acknowledged: true,
      modifiedCount: 0,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });
    const response = await request(app)
      .post("/user/journal/edit")
      .send(mockJournal)
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    const mockUserWithJournal = mockUsersWithJournals[0];
    (findOneByUsernameOrEmail as jest.Mock).mockResolvedValue(undefined);
    (findOneById as jest.Mock).mockResolvedValue({
      ...mockUserWithJournal,
      _id: "66e9c7cf8c3d258adecba9a4",
    });
    (insertOne as jest.Mock).mockResolvedValue({
      acknowledged: true,
      insertedId: new ObjectId("66e9c7cf8c3d258adecba9a4"),
    });
    (updateOne as jest.Mock).mockResolvedValue({
      acknowledged: true,
      modifiedCount: 0,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });

    const response = await request(app)
      .post("/user/journal/edit")
      .send({
        userId: mockUserWithJournal._id,
        journalId: mockUserWithJournal.journals[0]._id,
        title: "New Title",
        entry: "New Entry",
        category: "New Category",
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /journal/journals
 */
describe("Protected Routes - /journal/journals", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).get(
      `/user/journal/journals/66c1fabdebae7aad2803ef28`
    );
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (findOneById as jest.Mock).mockResolvedValue({
      _id: new ObjectId("66c1fabdebae7aad2803ef28"),
      username: "user3",
      email: "user3@gmail.com",
      journals: [],
      journalCategories: [],
    });
    const response = await request(app)
      .get("/user/journal/journals/66c1fabdebae7aad2803ef28")
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /journal/delete
 */
describe("Protected Routes - /journal/delete", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).post("/user/journal/delete");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (updateOne as jest.Mock).mockResolvedValue({
      acknowledged: true,
      modifiedCount: 0,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });
    const response = await request(app)
      .put("/user/journal/delete")
      .send({
        userId: new ObjectId(),
        journalIds: [new ObjectId()],
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

// TODO: need to implement this route
describe.skip("Protected Routes - /journal/deleteSelectedJournals", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).post(
      "/user/journal/deleteSelectedJournals"
    );
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    const response = await request(app)
      .post("/user/journal/deleteSelectedJournals")
      .send({
        userId: new ObjectId(),
        journalIds: [new ObjectId()],
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /journal/create-many
 */
describe("Protected Routes - /journal/category/create-many", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).post("/user/journal/create-many");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    const response = await request(app)
      .post("/user/journal/category/create-many")
      .send({
        userId: new ObjectId(),
        journalIds: [new ObjectId()],
        category: "Test Category",
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /journal/category/create
 */
describe("Protected Routes - /journal/category/create", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .post("/user/journal/category/create")
      .send({
        userId: new ObjectId(),
        category: "Test Category",
      })
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (updateOne as jest.Mock).mockResolvedValue({
      ...responses.success(),
    });
    const response = await request(app)
      .post("/user/journal/category/create")
      .send({
        userId: new ObjectId(),
        category: "Test Category",
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /journal/category/delete
 */
describe("Protected Routes - /journal/category/delete", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .delete(
        "/user/journal/category/delete/66c1fabdebae7aad2803ef28/66c1fabdebae7aad2803ef28"
      )
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (updateOne as jest.Mock).mockResolvedValue({
      ...responses.success(),
    });
    const response = await request(app)
      .delete(
        "/user/journal/category/delete/66c1fabdebae7aad2803ef28/66c1fabdebae7aad2803ef28"
      )
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

describe("Protected Routes - /journal/category/edit", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .put("/user/journal/category/edit")
      .send({
        userId: new ObjectId(),
        categoryId: new ObjectId(),
        category: "Test Category",
        selected: true,
      })
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (updateOne as jest.Mock).mockResolvedValue({
      acknowledged: true,
      modifiedCount: 0,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });
    const response = await request(app)
      .put("/user/journal/category/edit")
      .send({
        userId: new ObjectId(),
        categoryId: new ObjectId(),
        category: "Test Category",
        selected: true,
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});
