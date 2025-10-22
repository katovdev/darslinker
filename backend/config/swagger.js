import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { PORT } from "./env.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Online Education Platform API",
    version: "1.0.0",
    description: "The Online Education Platform API description",
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api`,
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
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
  apis: ["./routes/*.js"],
};

export default function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));
}
