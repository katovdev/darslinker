import { Router } from "express";
import * as blogController from "../controllers/blog.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateAdmin } from "../middlewares/role.middleware.js";

const blogRouter = Router();

// Public routes (no authentication required)
blogRouter.get("/", blogController.findAll);
blogRouter.get("/featured", blogController.getFeatured);
blogRouter.get("/sitemap.xml", blogController.generateSitemap);
blogRouter.get("/:id", blogController.findOne);
blogRouter.get("/:id/related", blogController.getRelated);
blogRouter.post("/:id/view", blogController.trackView);

// Admin routes (authentication and admin role required)
blogRouter.get("/archive", authenticate, validateAdmin, blogController.getArchived);
blogRouter.post("/", authenticate, validateAdmin, blogController.create);
blogRouter.put("/:id", authenticate, validateAdmin, blogController.update);
blogRouter.put("/:id/archive", authenticate, validateAdmin, blogController.archive);
blogRouter.put("/:id/unarchive", authenticate, validateAdmin, blogController.unarchive);
blogRouter.delete("/:id", authenticate, validateAdmin, blogController.deleteBlog);

export default blogRouter;