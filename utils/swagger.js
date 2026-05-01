const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

function setupSwagger(app) {
  const apiUrl = process.env.API_URL;;
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Express Documents API",
        version: "1.0.0",
        description: "API documentation for the e-auth-server-service oauth2.0 micro-service",
      },
      servers: [
        { url: apiUrl, description: "Local server" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
    apis: ["./app.js",
      "./routes/authRoutes.js",
      "./routes/gitRoutes.js",
      "./routes/googleRoutes.js",
      "./routes/userRoutes.js",
      "./routes/docRoutes.js ",
      "./routes/inviteRoutes.js "
    ],
  };

  const specs = swaggerJsDoc(options);
  app.use("/docs/", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
