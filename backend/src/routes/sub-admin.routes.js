import { Router } from "express";
import {
  createSubAdmin,
  getTeacherSubAdmins,
  getSubAdmin,
  updateSubAdmin,
  updateSubAdminPassword,
  deleteSubAdmin,
  loginSubAdmin,
  adminLogin,
  getSubAdminDashboard,
} from "../controllers/sub-admin.controller.js";

import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
  createSubAdminSchema,
  updateSubAdminSchema,
  updateSubAdminPasswordSchema,
  subAdminLoginSchema,
  subAdminIdSchema,
  teacherIdParamSchema,
  subAdminQuerySchema,
} from "../validations/sub-admin.validation.js";

const subAdminRouter = Router();

// Public routes
subAdminRouter.post(
  "/login",
  validate(subAdminLoginSchema, "body"),
  loginSubAdmin
);

subAdminRouter.post(
  "/admin-login",
  validate(subAdminLoginSchema, "body"),
  adminLogin
);

// Test endpoint to verify admin token
subAdminRouter.get(
  "/admin-test",
  authenticate,
  (req, res) => {
    console.log("🧪 Admin test endpoint hit:", {
      user: req.user,
      headers: req.headers.authorization?.substring(0, 20) + "..."
    });
    
    res.json({
      success: true,
      message: "Admin token is valid",
      user: req.user
    });
  }
);

// Protected routes (require authentication)
subAdminRouter.use(authenticate);

// Teacher routes - manage sub-admins
subAdminRouter.post(
  "/teachers/:teacherId/sub-admins",
  validate(teacherIdParamSchema, "params"),
  validate(createSubAdminSchema, "body"),
  createSubAdmin
);

subAdminRouter.get(
  "/teachers/:teacherId/sub-admins",
  validate(teacherIdParamSchema, "params"),
  getTeacherSubAdmins
);

// Sub-admin specific routes
subAdminRouter.get(
  "/:id",
  validate(subAdminIdSchema, "params"),
  getSubAdmin
);

subAdminRouter.put(
  "/:id",
  validate(subAdminIdSchema, "params"),
  validate(updateSubAdminSchema, "body"),
  updateSubAdmin
);

subAdminRouter.put(
  "/:id/password",
  validate(subAdminIdSchema, "params"),
  validate(updateSubAdminPasswordSchema, "body"),
  updateSubAdminPassword
);

subAdminRouter.delete(
  "/:id",
  validate(subAdminIdSchema, "params"),
  deleteSubAdmin
);

subAdminRouter.get(
  "/:id/dashboard",
  validate(subAdminIdSchema, "params"),
  getSubAdminDashboard
);

export default subAdminRouter;