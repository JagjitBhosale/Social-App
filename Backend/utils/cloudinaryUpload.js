const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const uploadToCloudinary = async (filePath, folder = 'social-tree/posts', resourceType = 'image') => {
  const cloudUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const useUrl = cloudUrl && !cloudUrl.includes('<') && !cloudUrl.includes('>');
  const useVars = cloudName && cloudName !== 'your_cloud_name' && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
  const useCloudinary = useUrl || useVars;

  if (useCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder + (resourceType === 'video' ? '-videos' : ''),
        resource_type: resourceType,
      });
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return { public_id: result.public_id, url: result.secure_url };
    } catch (error) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw error;
    }
  }

  // Local fallback: save to uploads folder and return URL
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const ext = path.extname(filePath);
  const filename = `${folder.replace(/\//g, '-')}-${Date.now()}${ext}`;
  const destPath = path.join(uploadsDir, filename);
  fs.copyFileSync(filePath, destPath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return {
    public_id: `local-${filename}`,
    url: `${BASE_URL}/uploads/${filename}`,
  };
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (publicId?.startsWith('local-')) return; // Local files: no-op
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
