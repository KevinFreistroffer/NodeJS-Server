// lambda.js
const awsServerlessExpress = require("aws-serverless-express");
import Server from "./server";

const app = new Server(80);
// Create the server with Express
const server = awsServerlessExpress.createServer(app.start());

// Export the handler for Lambda
exports.handler = (event: any, context: any) => {
  awsServerlessExpress.proxy(server.s, event, context);
};
