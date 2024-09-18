import dotenv from "dotenv";

dotenv.config();

export const getBearerToken = () => {
  console.log("process.env.TEST_TOKEN: ", process.env.TEST_TOKEN);
  return `Bearer ${process.env.TEST_TOKEN}`;
};
