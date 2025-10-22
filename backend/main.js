import express from "express";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 4005;

const app = express();
app.use(express.json());

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Online Education Platform API",
    version: "1.0.0",
    description: "Online Education Platform API description",
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

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));

app.listen(PORT, () =>
  console.log(
    `Project server started successfully on port ${PORT} || Swagger URL: http://localhost:${PORT}/api-docs`
  )
);
