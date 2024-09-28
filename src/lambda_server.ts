// lambda.js
const awsServerlessExpress = require("aws-serverless-express");
import { server } from "./server";

// Create the server with Express
const serverProxy = awsServerlessExpress.createServer(server);

// Export the handler for Lambda
exports.handler = (event: any, context: any) => {
  awsServerlessExpress.proxy(serverProxy, event, context);
};
