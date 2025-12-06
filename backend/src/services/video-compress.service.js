import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';

/**
 * Compress video using FFmpeg
 * @param {string} inputPath - Input video file path
 * @param {string} outputPath - Output video file path
 * @param {object} options - Compression options
 * @returns {Promise<string>} - Output file path
 */
export async function compressVideo(inputPath, outputPath, options = {}) {
  const {
    quality = 'medium', // low, medium, high
    resolution = '720p', // 360p, 480p, 720p, 1080p
    removeAudio = false
  } = options;

  // Quality presets
  const qualitySettings = {
    low: { crf: 28, preset: 'fast' },
    medium: { crf: 23, preset: 'medium' },
    high: { crf: 18, preset: 'slow' }
  };

  // Resolution settings
  const resolutionSettings = {
    '360p': '640x360',
    '480p': '854x480',
    '720p': '1280x720',
    '1080p': '1920x1080'
  };

  const { crf, preset } = qualitySettings[quality];
  const scale = resolutionSettings[resolution];

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .outputOptions([
        `-crf ${crf}`,
        `-preset ${preset}`,
        '-movflags +faststart', // Web optimization
        '-pix_fmt yuv420p'
      ])
      .size(scale);

    if (removeAudio) {
      command = command.noAudio();
    } else {
      command = command.audioCodec('aac').audioBitrate('128k');
    }

    command
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('🎬 FFmpeg started:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`⏳ Processing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('✅ Video compression completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Get video info
 */
export async function getVideoInfo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration,
          size: metadata.format.size,
          bitrate: metadata.format.bit_rate,
          width: videoStream?.width,
          height: videoStream?.height,
          codec: videoStream?.codec_name
        });
      }
    });
  });
}

/**
 * Create multiple quality versions
 */
export async function createMultipleQualities(inputPath, outputDir) {
  const qualities = [
    { name: '360p', resolution: '360p', quality: 'low' },
    { name: '720p', resolution: '720p', quality: 'medium' },
    { name: '1080p', resolution: '1080p', quality: 'high' }
  ];

  const results = [];

  for (const q of qualities) {
    const outputPath = path.join(outputDir, `video_${q.name}.mp4`);
    await compressVideo(inputPath, outputPath, {
      quality: q.quality,
      resolution: q.resolution
    });
    results.push({ quality: q.name, path: outputPath });
  }

  return results;
}
