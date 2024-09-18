// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Express Server API",
      version: "1.0.0",
      description: "API documentation",
    },
  },
  apis: ["./router/routes/user/*.ts"], // Path to your API routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
