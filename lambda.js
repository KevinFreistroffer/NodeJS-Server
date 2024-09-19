// lambda.js
const awsServerlessExpress = require("aws-serverless-express");
const Server = require("./src/server.js");

const app = new Server(80);
// Create the server with Express
const server = awsServerlessExpress.createServer(app.start());

// Export the handler for Lambda
exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server.s, event, context);
};
