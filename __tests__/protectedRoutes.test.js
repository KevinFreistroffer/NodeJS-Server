"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const middleware_1 = require("../src/middleware");
const test_utils_1 = require("../src/test-utils");
const mongodb_1 = require("mongodb");
const user_operations_1 = require("../src/operations/user_operations");
const user_1 = require("../src/defs/responses/user");
const mock_journals_1 = require("../__mocks__/mock_journals");
const mock_users_1 = require("../__mocks__/mock_users");
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
// jest.mock("../src/middleware", () => ({
//   verifyToken: jest.fn((req, res, next) => next()),
// }));
const app = (0, express_1.default)();
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
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(middleware_1.verifyToken);
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
app.use("*", (req, res, next) => {
    console.log(req.baseUrl);
    next();
});
beforeEach(() => {
    jest.clearAllMocks();
});
/**
 * /user/users
 */
describe("Protected Routes - /user/users", () => {
    user_operations_1.findAllUsers.mockResolvedValue(mock_users_1.mockUsersWithJournals);
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app).get("/user/users");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/user/users")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        // expect(verifyToken).toHaveBeenCalled();
        expect(response.status).toBe(200);
    });
});
/**
 * /user/username-available
 */
describe("Protected Routes - /user/username-available", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        user_operations_1.findOneByUsername.mockResolvedValue(mock_users_1.mockUser);
        const response = await (0, supertest_1.default)(app)
            .post("/user/username-available")
            .send({ username: "newuser" })
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        user_operations_1.findOneByUsername.mockResolvedValue(mock_users_1.mockUser);
        const response = await (0, supertest_1.default)(app)
            .post("/user/username-available")
            .send({ username: "newuser" })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /user/email-available
 */
describe("Protected Routes - /user/email-available", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        user_operations_1.findOneByEmail.mockResolvedValue(mock_users_1.mockUser);
        const response = await (0, supertest_1.default)(app)
            .post("/user/email-available")
            .send({ email: "newuser" })
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        user_operations_1.findOneByEmail.mockResolvedValue(mock_users_1.mockUser);
        const response = await (0, supertest_1.default)(app)
            .post("/user/email-available")
            .send({ email: "newuser@example.com" })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /journal/create
 */
describe("Protected Routes - /journal/create", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/create")
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/create")
            .send({
            userId: new mongodb_1.ObjectId(),
            title: "Test Journal",
            entry: "Test Entry",
            category: "Test Category",
        })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /journal/edit
 */
describe("Protected Routes - /journal/edit", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        user_operations_1.updateOne.mockResolvedValue({
            acknowledged: true,
            modifiedCount: 0,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1,
        });
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/edit")
            .send(mock_journals_1.mockJournal)
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        const mockUserWithJournal = mock_users_1.mockUsersWithJournals[0];
        user_operations_1.findOneByUsernameOrEmail.mockResolvedValue(undefined);
        user_operations_1.findOneById.mockResolvedValue({
            ...mockUserWithJournal,
            _id: "66e9c7cf8c3d258adecba9a4",
        });
        user_operations_1.insertOne.mockResolvedValue({
            acknowledged: true,
            insertedId: new mongodb_1.ObjectId("66e9c7cf8c3d258adecba9a4"),
        });
        user_operations_1.updateOne.mockResolvedValue({
            acknowledged: true,
            modifiedCount: 0,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1,
        });
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/edit")
            .send({
            userId: mockUserWithJournal._id,
            journalId: mockUserWithJournal.journals[0]._id,
            title: "New Title",
            entry: "New Entry",
            category: "New Category",
        })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /journal/journals
 */
describe("Protected Routes - /journal/journals", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app).get(`/user/journal/journals/66c1fabdebae7aad2803ef28`);
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        user_operations_1.findOneById.mockResolvedValue({
            _id: new mongodb_1.ObjectId("66c1fabdebae7aad2803ef28"),
            username: "user3",
            email: "user3@gmail.com",
            journals: [],
            journalCategories: [],
        });
        const response = await (0, supertest_1.default)(app)
            .get("/user/journal/journals/66c1fabdebae7aad2803ef28")
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /journal/delete
 */
describe("Protected Routes - /journal/delete", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app).post("/user/journal/delete");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        user_operations_1.updateOne.mockResolvedValue({
            acknowledged: true,
            modifiedCount: 0,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1,
        });
        const response = await (0, supertest_1.default)(app)
            .put("/user/journal/delete")
            .send({
            userId: new mongodb_1.ObjectId(),
            journalIds: [new mongodb_1.ObjectId()],
        })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
// TODO: need to implement this route
describe.skip("Protected Routes - /journal/deleteSelectedJournals", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app).post("/user/journal/deleteSelectedJournals");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/deleteSelectedJournals")
            .send({
            userId: new mongodb_1.ObjectId(),
            journalIds: [new mongodb_1.ObjectId()],
        })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /journal/create-many
 */
describe("Protected Routes - /journal/category/create-many", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app).post("/user/journal/create-many");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/category/create-many")
            .send({
            userId: new mongodb_1.ObjectId(),
            journalIds: [new mongodb_1.ObjectId()],
            category: "Test Category",
        })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /journal/category/create
 */
describe("Protected Routes - /journal/category/create", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/category/create")
            .send({
            userId: new mongodb_1.ObjectId(),
            category: "Test Category",
        })
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        user_operations_1.updateOne.mockResolvedValue({
            ...user_1.responses.success(),
        });
        const response = await (0, supertest_1.default)(app)
            .post("/user/journal/category/create")
            .send({
            userId: new mongodb_1.ObjectId(),
            category: "Test Category",
        })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
/**
 * /journal/category/delete
 */
describe("Protected Routes - /journal/category/delete", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app)
            .delete("/user/journal/category/delete/66c1fabdebae7aad2803ef28/66c1fabdebae7aad2803ef28")
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        user_operations_1.updateOne.mockResolvedValue({
            ...user_1.responses.success(),
        });
        const response = await (0, supertest_1.default)(app)
            .delete("/user/journal/category/delete/66c1fabdebae7aad2803ef28/66c1fabdebae7aad2803ef28")
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
describe("Protected Routes - /journal/category/edit", () => {
    it("should deny access and return 401 if no token is provided", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/user/journal/category/edit")
            .send({
            userId: new mongodb_1.ObjectId(),
            categoryId: new mongodb_1.ObjectId(),
            category: "Test Category",
            selected: true,
        })
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
    });
    it("should allow access with a valid token", async () => {
        user_operations_1.updateOne.mockResolvedValue({
            acknowledged: true,
            modifiedCount: 0,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1,
        });
        const response = await (0, supertest_1.default)(app)
            .put("/user/journal/category/edit")
            .send({
            userId: new mongodb_1.ObjectId(),
            categoryId: new mongodb_1.ObjectId(),
            category: "Test Category",
            selected: true,
        })
            .set("Accept", "application/json")
            .set("Authorization", (0, test_utils_1.getBearerToken)());
        expect(response.status).toBe(200);
    });
});
