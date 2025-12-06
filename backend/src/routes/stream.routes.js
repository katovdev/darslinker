import { Router } from "express";
import { streamFromR2, getR2StreamUrl } from "../controllers/stream.controller.js";

const streamRouter = Router();

/**
 * Stream video from R2 with range support
 * GET /api/stream/r2/videos/filename.mp4
 */
streamRouter.get('/r2/:folder/:filename', (req, res, next) => {
  const { folder, filename } = req.params;
  req.params.key = `${folder}/${filename}`;
  streamFromR2(req, res, next);
});

/**
 * Get signed URL for R2 video
 * GET /api/stream/r2-url/videos/filename.mp4
 */
streamRouter.get('/r2-url/:folder/:filename', (req, res, next) => {
  const { folder, filename } = req.params;
  req.params.key = `${folder}/${filename}`;
  getR2StreamUrl(req, res, next);
});

export default streamRouter;
