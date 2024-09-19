import dotenv from "dotenv";

dotenv.config();

export const getBearerToken = () => {
  return `Bearer ${process.env.TEST_TOKEN}`;
};
