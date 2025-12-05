import 'dotenv/config';
import mongoose from 'mongoose';
import Course from './src/models/course.model.js';
import { uploadToR2 } from './src/services/r2-upload.service.js';
import axios from 'axios';

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_ATLAS_URL);
console.log('✅ Connected to MongoDB\n');

async function downloadFromCloudinary(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    return null;
  }
}

function getFileTypeFromUrl(url) {
  if (url.includes('/video/')) return 'video';
  if (url.includes('/image/')) return 'image';
  return 'file';
}

function getMimeType(url) {
  const ext = url.split('.').pop().split('?')[0].toLowerCase();
  const mimeTypes = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function migrateCourses() {
  console.log('🔍 Finding courses with Cloudinary URLs...\n');
  
  const courses = await Course.find({
    $or: [
      { thumbnail: /cloudinary\.com/ },
      { 'modules.lessons.videoUrl': /cloudinary\.com/ }
    ]
  });

  console.log(`📊 Found ${courses.length} courses to migrate\n`);

  let migratedCount = 0;
  let errorCount = 0;

  for (const course of courses) {
    console.log(`\n📚 Course: ${course.title}`);
    let courseUpdated = false;

    // Migrate course thumbnail
    if (course.thumbnail && course.thumbnail.includes('cloudinary.com')) {
      console.log('  🖼️  Migrating thumbnail...');
      try {
        const buffer = await downloadFromCloudinary(course.thumbnail);
        if (buffer) {
          const fileName = `course-${course._id}-thumbnail.jpg`;
          const newUrl = await uploadToR2(buffer, fileName, 'image/jpeg', 'images');
          course.thumbnail = newUrl;
          courseUpdated = true;
          console.log('  ✅ Thumbnail migrated');
        }
      } catch (error) {
        console.error('  ❌ Thumbnail migration failed:', error.message);
        errorCount++;
      }
    }

    // Migrate lesson videos
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.videoUrl && lesson.videoUrl.includes('cloudinary.com')) {
          console.log(`  🎥 Migrating video: ${lesson.title}`);
          try {
            const buffer = await downloadFromCloudinary(lesson.videoUrl);
            if (buffer) {
              const fileName = `lesson-${lesson._id}-video.mp4`;
              const mimeType = getMimeType(lesson.videoUrl);
              const folder = mimeType.startsWith('video/') ? 'videos' : 'files';
              const newUrl = await uploadToR2(buffer, fileName, mimeType, folder);
              lesson.videoUrl = newUrl;
              courseUpdated = true;
              console.log('  ✅ Video migrated');
            }
          } catch (error) {
            console.error(`  ❌ Video migration failed: ${error.message}`);
            errorCount++;
          }
        }

        // Migrate assignment files
        if (lesson.type === 'assignment' && lesson.fileUrl && lesson.fileUrl.includes('cloudinary.com')) {
          console.log(`  📄 Migrating assignment file: ${lesson.title}`);
          try {
            const buffer = await downloadFromCloudinary(lesson.fileUrl);
            if (buffer) {
              const fileName = `assignment-${lesson._id}-${lesson.fileName || 'file'}`;
              const mimeType = getMimeType(lesson.fileUrl);
              const newUrl = await uploadToR2(buffer, fileName, mimeType, 'files');
              lesson.fileUrl = newUrl;
              courseUpdated = true;
              console.log('  ✅ Assignment file migrated');
            }
          } catch (error) {
            console.error(`  ❌ Assignment file migration failed: ${error.message}`);
            errorCount++;
          }
        }

        // Migrate file lesson files
        if (lesson.type === 'file' && lesson.fileUrl && lesson.fileUrl.includes('cloudinary.com')) {
          console.log(`  📁 Migrating file lesson: ${lesson.title}`);
          try {
            const buffer = await downloadFromCloudinary(lesson.fileUrl);
            if (buffer) {
              const fileName = `file-lesson-${lesson._id}-${lesson.fileName || 'file'}`;
              const mimeType = getMimeType(lesson.fileUrl);
              const newUrl = await uploadToR2(buffer, fileName, mimeType, 'files');
              lesson.fileUrl = newUrl;
              courseUpdated = true;
              console.log('  ✅ File lesson migrated');
            }
          } catch (error) {
            console.error(`  ❌ File lesson migration failed: ${error.message}`);
            errorCount++;
          }
        }
      }
    }

    // Save course if updated
    if (courseUpdated) {
      await course.save();
      migratedCount++;
      console.log(`  💾 Course saved with new R2 URLs`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`✅ Courses migrated: ${migratedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(50));
}

// Run migration
try {
  await migrateCourses();
  console.log('\n✅ Migration completed!');
} catch (error) {
  console.error('\n❌ Migration failed:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n👋 Disconnected from MongoDB');
  process.exit(0);
}
