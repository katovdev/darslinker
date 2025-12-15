import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateAdmin } from "../middlewares/role.middleware.js";

const categoryRouter = Router();

// Public routes (no authentication required)
categoryRouter.get("/", categoryController.findAll);
categoryRouter.get("/slug/:slug", categoryController.findBySlug);
categoryRouter.get("/:id", categoryController.findOne);
categoryRouter.get("/:id/blogs", categoryController.getBlogsByCategory);
categoryRouter.get("/:id/stats", categoryController.getStats);

// Admin routes (authentication and admin role required)
categoryRouter.post("/", authenticate, validateAdmin, categoryController.create);
categoryRouter.put("/:id", authenticate, validateAdmin, categoryController.update);
categoryRouter.put("/:id/activate", authenticate, validateAdmin, categoryController.activate);
categoryRouter.put("/:id/deactivate", authenticate, validateAdmin, categoryController.deactivate);
categoryRouter.delete("/:id", authenticate, validateAdmin, categoryController.deleteCategory);

export default categoryRouter;