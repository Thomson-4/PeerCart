/**
 * wipeCloudinary.js
 * Deletes all assets under the "peercart/" folder using Cloudinary Admin API.
 * Run: node scripts/wipeCloudinary.js
 *
 * Requires in .env:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteAllInFolder(folder) {
  let deleted = 0;
  let nextCursor = undefined;

  console.log(`Scanning Cloudinary folder: ${folder}`);

  do {
    // List up to 500 resources at a time
    const result = await cloudinary.api.resources({
      type:        'upload',
      prefix:      folder,
      max_results: 500,
      next_cursor: nextCursor,
    });

    const publicIds = result.resources.map((r) => r.public_id);

    if (publicIds.length === 0) {
      console.log('   No resources found in this batch.');
      break;
    }

    // Delete in chunks of 100 (Cloudinary API limit per call)
    const chunkSize = 100;
    for (let i = 0; i < publicIds.length; i += chunkSize) {
      const chunk = publicIds.slice(i, i + chunkSize);
      const delResult = await cloudinary.api.delete_resources(chunk);
      const deletedCount = Object.values(delResult.deleted).filter((v) => v === 'deleted').length;
      deleted += deletedCount;
      console.log(`   Deleted ${deletedCount} assets (total so far: ${deleted})`);
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  return deleted;
}

async function wipeCloudinary() {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`❌  Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  try {
    const deleted = await deleteAllInFolder('peercart/');

    if (deleted === 0) {
      console.log('\n✅  No Cloudinary assets found under peercart/ — nothing to delete.');
    } else {
      console.log(`\n✅  Deleted ${deleted} Cloudinary assets from peercart/`);
    }

    // Also try to delete the folder itself (only works if empty)
    try {
      await cloudinary.api.delete_folder('peercart');
      console.log('✅  Deleted empty peercart/ folder from Cloudinary.');
    } catch {
      // Folder may not exist or may have sub-folders — non-fatal
    }
  } catch (err) {
    console.error('❌  Cloudinary error:', err.message || err);
    process.exit(1);
  }
}

wipeCloudinary();
