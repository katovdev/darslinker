import { catchAsync } from "../middlewares/error.middleware.js";
import { getR2Client, R2_BUCKET_NAME } from "../../config/r2.config.js";
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from "../../config/logger.js";

/**
 * Stream video from R2
 * @route GET /stream/r2/:key
 * @access Public
 */
export const streamFromR2 = catchAsync(async (req, res) => {
  const { key } = req.params;
  const range = req.headers.range;

  try {
    const r2Client = getR2Client();
    
    // Get object metadata first
    const headCommand = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    });
    
    const { ContentLength, ContentType } = await r2Client.send(headCommand);
    
    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : ContentLength - 1;
      const chunksize = (end - start) + 1;
      
      // Get object with range
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Range: `bytes=${start}-${end}`
      });
      
      const { Body } = await r2Client.send(getCommand);
      
      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${ContentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': ContentType || 'video/mp4',
        'Cache-Control': 'public, max-age=31536000'
      });
      
      // Stream the body
      Body.pipe(res);
    } else {
      // No range, send entire file
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key
      });
      
      const { Body } = await r2Client.send(getCommand);
      
      res.writeHead(200, {
        'Content-Length': ContentLength,
        'Content-Type': ContentType || 'video/mp4',
        'Cache-Control': 'public, max-age=31536000'
      });
      
      Body.pipe(res);
    }
    
    logger.info("Video streamed from R2", {
      key,
      hasRange: !!range
    });
  } catch (error) {
    logger.error("R2 streaming error", {
      error: error.message,
      key
    });
    
    res.status(404).json({
      success: false,
      message: "Video not found"
    });
  }
});

/**
 * Get signed URL for direct R2 streaming
 * @route GET /stream/r2-url/:key
 * @access Public
 */
export const getR2StreamUrl = catchAsync(async (req, res) => {
  const { key } = req.params;
  const expiresIn = parseInt(req.query.expires) || 3600; // Default 1 hour
  
  try {
    const r2Client = getR2Client();
    
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    });
    
    // Generate presigned URL
    const url = await getSignedUrl(r2Client, command, {
      expiresIn: expiresIn
    });
    
    res.json({
      success: true,
      url,
      expiresIn
    });
    
    logger.info("R2 signed URL generated", {
      key,
      expiresIn
    });
  } catch (error) {
    logger.error("R2 signed URL error", {
      error: error.message,
      key
    });
    
    res.status(500).json({
      success: false,
      message: "Failed to generate streaming URL"
    });
  }
});
