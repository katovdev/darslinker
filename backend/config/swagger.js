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
  tags: [
    {
      name: "Auth",
      description:
        "Authentication and authorization endpoints - Register, login, OTP verification, and password management",
    },
    {
      name: "User Management - Students",
      description:
        "Student management endpoints - CRUD operations for student profiles, enrolled courses, and progress tracking",
    },
    {
      name: "User Management - Teachers",
      description:
        "Teacher management endpoints - CRUD operations for teacher profiles, courses, earnings, and ratings",
    },
    {
      name: "Course Management - Courses",
      description:
        "Course management endpoints - CRUD operations for courses, catalog management, pricing, and course details",
    },
    {
      name: "Module & Lesson Management - Modules",
      description:
        "Module management endpoints - CRUD operations for course modules, organizing course content into structured sections",
    },
    {
      name: "Module & Lesson Management - Lessons",
      description:
        "Lesson management endpoints - CRUD operations for module lessons, organizing module content into structured sections",
    },
    {
      name: "Homework & Assignment Management - Assignments",
      description:
        "Assignment management endpoints - CRUD operations for homework assignments, organizing assignment content into structured sections",
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
