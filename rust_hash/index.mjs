const hash = require("./index.js");
const crypto = require("node:crypto");

export const handler = async (event) => {
  console.log(hash);
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
