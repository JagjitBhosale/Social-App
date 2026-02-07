const { v2: cloudinary } = require('cloudinary');

// Prefer CLOUDINARY_URL if set and valid (no placeholders)
// Otherwise use individual env vars
const cloudUrl = process.env.CLOUDINARY_URL;
const useUrl = cloudUrl && !cloudUrl.includes('<') && !cloudUrl.includes('>');

if (useUrl) {
  cloudinary.config(); // SDK uses CLOUDINARY_URL from process.env
} else {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret && cloudName !== 'your_cloud_name') {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }
}

module.exports = cloudinary;
