import express from "express";
import request from "supertest";
import { findOneByUsernameOrEmail } from "../../../src/operations/user_operations";
import { responses } from "../../../src/defs/responses/generic";
import { rateLimiterMiddleware } from "../../../src/router/routes/user/create";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
dotenv.config();

jest.mock("../../../src/operations/user_operations", () => ({
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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user/create", require("../../../src/router/routes/user/create"));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

// List of functionalities that can be unit tested:
// 1. Rate limiting functionality
// 3. Checking if username or email already exists
// 4. User creation process
// 5. Error handling for various scenarios
// 6. Response format and content for different outcomes
// 7. Conversion of user document to safe user object
// 8. Integration with user operations (findOneByUsernameOrEmail, insertOne, findOneById)
// 9. Proper use of status codes
// 10. Escaping of input fields

describe("/user/create", () => {
  it("rate limiting functionality", async () => {
    jest.mock("../../../src/router/routes/user/create", () => ({
      rateLimiterMiddleware: jest.fn((req, res, next) => {
        const limiter = rateLimit({
          windowMs: 1, // 15 minutes
          max: 1, // Limit each IP to 5 create account requests per windowMs
          message:
            "Too many accounts created from this IP, please try again later",
        });

        return limiter;
      }),
    }));
    // Test rate limiting functionality
    const makeRequests = async (count: number) => {
      const requests = [];
      for (let i = 0; i < count; i++) {
        requests.push(
          request(app).post("/user/create").send({
            username: "test",
            email: "test@example.com",
            password: "password",
          })
        );
      }
      return Promise.all(requests);
    };

    const responses = await makeRequests(2);

    // First 5 requests should be successful
    for (let i = 0; i < 5; i++) {
      expect(responses[i].status).not.toBe(429);
    }

    // The 6th request should be rate limited
    expect(responses[5].status).toBe(429);
    expect(responses[5].text).toContain(
      "Too many accounts created from this IP, please try again later"
    );

    // Wait for the rate limit window to reset
    await new Promise((resolve) => setTimeout(resolve, 15 * 60 * 1000));

    // After waiting, we should be able to make a request again
    const newResponse = await request(app).post("/user/create").send({
      username: "test",
      email: "test@example.com",
      password: "password",
    });

    expect(newResponse.status).not.toBe(429);
  }, 30000);

  it("should return an error if the request body is missing", async () => {
    jest.mock("../../../src/router/routes/user/create", () => ({
      rateLimiterMiddleware: jest.fn((req, res, next) => {
        next();
      }),
    }));
    // (findOneByUsernameOrEmail as jest.Mock).mockResolvedValue(undefined);
    const response = await request(app).post("/user/create").send({});
    expect(response.status).toBe(422);
    expect(response.body).toEqual(responses.missing_body_fields());
  });
});
