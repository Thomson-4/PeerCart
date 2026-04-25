/**
 * Cloudinary utility — Round 8B
 * Listing images get a timestamp watermark overlay after upload.
 * Student ID photos are uploaded plain (no watermark).
 */

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary and return the result.
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  });

/**
 * Build a Cloudinary URL with a "PeerCart • DD/MM/YYYY HH:MM" watermark overlay.
 * Applied to listing images only.
 *
 * @param {string} publicId  Cloudinary public_id of the uploaded image
 * @returns {string}         Transformed URL with watermark
 */
const addTimestampWatermark = (publicId) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `PeerCart ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Cloudinary text overlay transformation
  return cloudinary.url(publicId, {
    transformation: [
      {
        overlay: {
          font_family: 'Arial',
          font_size: 14,
          font_weight: 'bold',
          text: timestamp,
        },
        color: 'white',
        // Black shadow for readability
        effect: 'shadow:40',
        gravity: 'south_west',
        x: 10,
        y: 10,
      },
    ],
    secure: true,
  });
};

/**
 * Upload a listing image and return the watermarked URL.
 * Falls back to the original secure_url if watermarking fails.
 *
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<string>} Watermarked image URL
 */
const uploadListingImage = async (buffer, folder = 'peercart/listings') => {
  const result = await uploadBuffer(buffer, folder);
  try {
    return addTimestampWatermark(result.public_id);
  } catch (err) {
    console.error('[cloudinary] Watermark failed — returning original URL:', err.message);
    return result.secure_url;
  }
};

module.exports = { uploadBuffer, uploadListingImage, addTimestampWatermark };
