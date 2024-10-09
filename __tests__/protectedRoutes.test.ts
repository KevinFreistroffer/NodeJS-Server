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
import { mockEntry } from "../__mocks__/mock_entrys";
import { getMockUsers } from "../__mocks__/mock_users";
import dotenv from "dotenv";

dotenv.config();

jest.mock("../src/operations/user_operations", () => ({
  findOneById: jest.fn(),
  findOneByUsername: jest.fn(),
  findOneByEmail: jest.fn(),
  findOneByUsernameOrEmail: jest.fn(),
  findAllUsers: jest.fn(),
  createEntry: jest.fn(),
  findAllEntries: jest.fn(),
  deleteEntry: jest.fn(),
  deleteSelectedEntries: jest.fn(),
  deleteSelectedCategories: jest.fn(),
  updateEntryCategories: jest.fn(),
  addCategory: jest.fn(),
  updateOne: jest.fn(),
  insertOne: jest.fn(),
}));

jest.mock("../src/middleware", () => ({
  verifyToken: jest.fn((req, res, next) => {
    const authHeader = req.headers["authorization"];
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
const entryCreateRoute = require("../src/router/routes/user/entry/create");
const entryCreateCategoryRoute = require("../src/router/routes/user/entry/category/create");
const entryEditRoute = require("../src/router/routes/user/entry/edit");
const entryEntriesRoute = require("../src/router/routes/user/entry/entries");
const entryDeleteRoute = require("../src/router/routes/user/entry/delete");
const entryCategoryEditRoute = require("../src/router/routes/user/entry/category/edit");
const entryCategoryDeleteRoute = require("../src/router/routes/user/entry/category/delete");
const createManyEntryCategoryRoute = require("../src/router/routes/user/entry/category/create-many");
// const entryDeleteSelectedEntriesRoute = require("../src/router/routes/user/entry/deleteSelectedEntries");
// const entryDeleteSelectedCategoriesRoute = require("../src/router/routes/user/entry/deleteSelectedCategories");
// const entryUpdateEntryCategoriesRoute = require("../src/router/routes/user/entry/updateEntryCategories");

const userId = "66c1fabdebae7aad2803ef28";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(verifyToken);
app.use("/user/users", usersRoute);
app.use("/user/create", createRoute);
app.use("/user/username-available", usernameAvailableRoute);
app.use("/user/email-available", emailAvailableRoute);
app.use("/auth/bearer", authBearerRoute);
app.use("/user/entry/create", entryCreateRoute);
app.use("/user/entry/category/create", entryCreateCategoryRoute);
app.use("/user/entry/edit", entryEditRoute);
app.use(`/user/entry/entries`, entryEntriesRoute);
app.use("/user/entry/delete", entryDeleteRoute);
app.use("/user/entry/category/create-many", createManyEntryCategoryRoute);
app.use("/user/entry/category/delete", entryCategoryDeleteRoute);
app.use("/user/entry/category/edit", entryCategoryEditRoute);

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * /user/users
 */
describe("Protected Routes - /user/users", () => {
  (findAllUsers as jest.Mock).mockResolvedValue(
    getMockUsers({
      numUsersToGet: 2,
      numEntriesToGet: 1,
      numCategoriesToGet: 1,
      addMongoObjectIds: true,
    })
  );
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
    (findOneByUsername as jest.Mock).mockResolvedValue(
      getMockUsers({
        numUsersToGet: 1,
        numEntriesToGet: 0,
        numCategoriesToGet: 0,
        addMongoObjectIds: true,
      })
    );
    const response = await request(app)
      .post("/user/username-available")
      .send({ username: "newuser" })
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });
  it("should allow access with a valid token", async () => {
    (findOneByUsername as jest.Mock).mockResolvedValue(
      getMockUsers({
        numUsersToGet: 1,
        numEntriesToGet: 0,
        numCategoriesToGet: 0,
        addMongoObjectIds: true,
      })
    );

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
    (findOneByEmail as jest.Mock).mockResolvedValue(
      getMockUsers({
        numUsersToGet: 1,
        numEntriesToGet: 0,
        numCategoriesToGet: 0,
        addMongoObjectIds: true,
      })
    );
    const response = await request(app)
      .post("/user/email-available")
      .send({ email: "newuser" })
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });
  it("should allow access with a valid token", async () => {
    (findOneByEmail as jest.Mock).mockResolvedValue(
      getMockUsers({
        numUsersToGet: 1,
        numEntriesToGet: 0,
        numCategoriesToGet: 0,
        addMongoObjectIds: true,
      })
    );

    const response = await request(app)
      .post("/user/email-available")
      .send({ email: "newuser@example.com" })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /entry/create
 */
describe("Protected Routes - /entry/create", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .post("/user/entry/create")
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    const response = await request(app)
      .post("/user/entry/create")
      .send({
        userId: new ObjectId(),
        title: "Test Entry",
        entry: "Test Entry",
        category: "Test Category",
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /entry/edit
 */
describe("Protected Routes - /entry/edit", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    (updateOne as jest.Mock).mockResolvedValue({
      acknowledged: true,
      modifiedCount: 0,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });
    const response = await request(app)
      .post("/user/entry/edit")
      .send(mockEntry)
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (findOneByUsernameOrEmail as jest.Mock).mockResolvedValue(undefined);
    (findOneById as jest.Mock).mockResolvedValue(
      getMockUsers({
        numUsersToGet: 1,
        numEntriesToGet: 1,
        numCategoriesToGet: 0,
        addMongoObjectIds: true,
      })
    );
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

    const mockUser = getMockUsers({
      numUsersToGet: 1,
      numEntriesToGet: 1,
      numCategoriesToGet: 0,
      addMongoObjectIds: true,
    })[0];

    const response = await request(app)
      .post("/user/entry/edit")
      .send({
        userId: mockUser._id,
        entryId: mockUser.entries[0]._id,
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
 * /entry/entries
 */
describe("Protected Routes - /entry/entries", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).get(
      `/user/entry/entries/66c1fabdebae7aad2803ef28`
    );
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (findOneById as jest.Mock).mockResolvedValue({
      _id: new ObjectId("66c1fabdebae7aad2803ef28"),
      username: "user3",
      email: "user3@gmail.com",
      entries: [],
      entryCategories: [],
    });
    const response = await request(app)
      .get("/user/entry/entries/66c1fabdebae7aad2803ef28")
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /entry/delete
 */
describe("Protected Routes - /entry/delete", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).post("/user/entry/delete");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    (updateOne as jest.Mock).mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });
    const response = await request(app)
      .delete("/user/entry/delete")
      .send({
        userId: new ObjectId(),
        entryIds: [new ObjectId()],
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

// TODO: need to implement this route
describe.skip("Protected Routes - /entry/deleteSelectedEntries", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).post(
      "/user/entry/deleteSelectedEntries"
    );
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    const response = await request(app)
      .post("/user/entry/deleteSelectedEntries")
      .send({
        userId: new ObjectId(),
        entryIds: [new ObjectId()],
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /entry/create-many
 */
describe("Protected Routes - /entry/category/create-many", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app).post("/user/entry/create-many");
    expect(response.status).toBe(401);
  });

  it("should allow access with a valid token", async () => {
    const response = await request(app)
      .post("/user/entry/category/create-many")
      .send({
        userId: new ObjectId(),
        entryIds: [new ObjectId()],
        category: "Test Category",
      })
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

/**
 * /entry/category/create
 */
describe("Protected Routes - /entry/category/create", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .post("/user/entry/category/create")
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
      .post("/user/entry/category/create")
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
 * /entry/category/delete
 */
describe("Protected Routes - /entry/category/delete", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .delete(
        "/user/entry/category/delete/66c1fabdebae7aad2803ef28/66c1fabdebae7aad2803ef28"
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
        "/user/entry/category/delete/66c1fabdebae7aad2803ef28/66c1fabdebae7aad2803ef28"
      )
      .set("Accept", "application/json")
      .set("Authorization", getBearerToken());
    expect(response.status).toBe(200);
  });
});

describe("Protected Routes - /entry/category/edit", () => {
  it("should deny access and return 401 if no token is provided", async () => {
    const response = await request(app)
      .put("/user/entry/category/edit")
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
      .put("/user/entry/category/edit")
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
