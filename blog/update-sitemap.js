#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Script to automatically update sitemap.xml with latest blog posts
 * This script fetches the sitemap from your backend API and updates the frontend public folder
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://darslinker.uz/api';
const SITEMAP_ENDPOINT = `${BACKEND_URL}/blogs/sitemap.xml`;
const FRONTEND_SITEMAP_PATH = path.join(__dirname, 'frontend/public/sitemap.xml');
const DIST_SITEMAP_PATH = path.join(__dirname, 'frontend/dist/sitemap.xml');

async function fetchSitemap() {
  return new Promise((resolve, reject) => {
    const url = SITEMAP_ENDPOINT;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function updateSitemap() {
  try {
    console.log('🔄 Fetching latest sitemap from backend...');
    const sitemapContent = await fetchSitemap();

    console.log('💾 Updating frontend sitemap.xml...');
    fs.writeFileSync(FRONTEND_SITEMAP_PATH, sitemapContent, 'utf8');

    // Also update dist folder if it exists
    if (fs.existsSync(path.dirname(DIST_SITEMAP_PATH))) {
      fs.writeFileSync(DIST_SITEMAP_PATH, sitemapContent, 'utf8');
      console.log('💾 Updated dist sitemap.xml');
    }

    console.log('✅ Sitemap updated successfully!');
    console.log(`📄 Sitemap saved to: ${FRONTEND_SITEMAP_PATH}`);

    // Count URLs in sitemap
    const urlCount = (sitemapContent.match(/<url>/g) || []).length;
    console.log(`🔗 Total URLs in sitemap: ${urlCount}`);

  } catch (error) {
    console.error('❌ Error updating sitemap:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  updateSitemap();
}

module.exports = { updateSitemap };