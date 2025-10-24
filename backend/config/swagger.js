import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { PORT } from "./env.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "DarsLinker - Online Education Platform API",
    version: "1.0.0",
    description:
      "Comprehensive REST API for DarsLinker online education platform. Manage students, teachers, courses, assignments, and quizzes with secure JWT authentication.",
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api-docs`,
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Enter your JWT access token (received from /auth/login endpoint)",
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"],
};

export default function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));
}
