#!/usr/bin/env node

/**
 * Blog Data Migration Script
 * 
 * This script migrates blog data from the NestJS backend to the Express.js backend
 * 
 * Usage:
 *   npm run migrate:blog
 *   node scripts/migrate-blog-data.js
 *   node scripts/migrate-blog-data.js --rollback /path/to/backup.json
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import BlogMigrationService from '../src/services/blog-migration.service.js';
import logger from '../config/logger.js';

// Load environment variables
dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const isRollback = args.includes('--rollback');
  const backupFile = isRollback ? args[args.indexOf('--rollback') + 1] : null;

  try {
    // Connect to target database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to target database');

    const migrationService = new BlogMigrationService();

    if (isRollback) {
      if (!backupFile) {
        throw new Error('Backup file path is required for rollback');
      }

      console.log('🔄 Starting rollback process...');
      console.log(`📁 Using backup file: ${backupFile}`);

      const rollbackResult = await migrationService.rollback(backupFile);

      console.log('✅ Rollback completed successfully!');
      console.log(`📊 Categories restored: ${rollbackResult.categoriesRestored}`);
      console.log(`📊 Blogs restored: ${rollbackResult.blogsRestored}`);

    } else {
      console.log('🚀 Starting blog data migration...');
      console.log('📋 This will migrate all blog data from NestJS to Express.js backend');
      
      // Confirm migration
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️  PRODUCTION ENVIRONMENT DETECTED');
        console.log('⚠️  Please ensure you have a recent backup before proceeding');
        
        // In production, require explicit confirmation
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise((resolve) => {
          rl.question('Do you want to continue? (yes/no): ', resolve);
        });
        rl.close();

        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ Migration cancelled');
          process.exit(0);
        }
      }

      const migrationResult = await migrationService.executeMigration();

      console.log('\n📊 Migration Results:');
      console.log('='.repeat(50));
      console.log(`✅ Success: ${migrationResult.success}`);
      console.log(`📁 Categories migrated: ${migrationResult.categoriesMigrated}`);
      console.log(`📄 Blogs migrated: ${migrationResult.blogsMigrated}`);
      console.log(`⚠️  Warnings: ${migrationResult.warnings.length}`);
      console.log(`❌ Errors: ${migrationResult.errors.length}`);
      console.log(`⏱️  Duration: ${Math.round(migrationResult.duration / 1000)}s`);
      console.log(`💾 Backup file: ${migrationResult.backup}`);

      if (migrationResult.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        migrationResult.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning}`);
        });
      }

      if (migrationResult.errors.length > 0) {
        console.log('\n❌ Errors:');
        migrationResult.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }

      console.log('\n📋 Validation Results:');
      console.log(`  Source categories: ${migrationResult.validation.sourceCategories}`);
      console.log(`  Target categories: ${migrationResult.validation.targetCategories}`);
      console.log(`  Source blogs: ${migrationResult.validation.sourceBlogs}`);
      console.log(`  Target blogs: ${migrationResult.validation.targetBlogs}`);
      console.log(`  Data integrity: ${migrationResult.validation.isValid ? '✅ Valid' : '❌ Issues found'}`);

      if (migrationResult.validation.issues.length > 0) {
        console.log('\n🔍 Validation Issues:');
        migrationResult.validation.issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue}`);
        });
      }

      if (migrationResult.success) {
        console.log('\n🎉 Migration completed successfully!');
        console.log('💡 You can now update your frontend and moderator to use the new API endpoints');
        console.log(`💡 To rollback if needed: node scripts/migrate-blog-data.js --rollback "${migrationResult.backup}"`);
      } else {
        console.log('\n❌ Migration completed with errors');
        console.log('💡 Please review the errors above and fix any issues');
        console.log(`💡 To rollback: node scripts/migrate-blog-data.js --rollback "${migrationResult.backup}"`);
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    logger.error('Migration script failed', { error: error.message, stack: error.stack });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from database');
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  logger.error('Uncaught exception in migration script', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled rejection in migration script', { reason, promise });
  process.exit(1);
});

// Run the migration
main();