import { Router } from "express";
import * as adviceController from "../controllers/advice.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Public routes
router.post('/', adviceController.createAdvice);

// Protected routes (for moderators/admins)
router.get('/', authenticate, validateAdmin, adviceController.getAllAdvices);
router.get('/stats', authenticate, validateAdmin, adviceController.getAdviceStats);
router.get('/:id', authenticate, validateAdmin, adviceController.getAdviceById);
router.put('/:id/status', authenticate, validateAdmin, adviceController.updateAdviceStatus);
router.delete('/:id', authenticate, validateAdmin, adviceController.deleteAdvice);

export default router;