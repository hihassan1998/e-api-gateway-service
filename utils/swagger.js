const swaggerUi = require("swagger-ui-express");

async function setupSwagger(app) {
  const gatewaySpec = {
    openapi: "3.0.0",
    info: {
      title: "Gateway API Docs",
      version: "1.0.0",
      description: "Merged API Gateway documentation",
    },
    servers: [
      { url: "http://localhost:3000", description: "Gateway server" }
      // { url: process.env.API_URL, description: "Gateway server" }
    ],
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: []
  };

  let authSpec = {};

  try {
    const res = await fetch("http://localhost:3001/swagger.json");
    authSpec = await res.json();
    console.log("Auth swagger loaded");
  } catch (err) {
    console.log("Auth swagger failed");
  }

  // MERGE SAFELY
  const mergedSpec = {
    ...gatewaySpec,
    paths: {
      ...(gatewaySpec.paths || {}),
      ...(authSpec.paths || {})
    },
    components: {
      ...gatewaySpec.components,
      ...(authSpec.components || {})
    }
  };

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(mergedSpec));
}

module.exports = setupSwagger;