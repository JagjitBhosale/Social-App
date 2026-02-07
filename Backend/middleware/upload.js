const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config - store temporarily for Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || (file.mimetype?.startsWith('video/') ? '.mp4' : '.jpg');
    cb(null, 'post-' + uniqueSuffix + ext);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = /^image\//.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files (jpeg, jpg, png, gif, webp)'), false);
};

const videoFilter = (req, file, cb) => {
  const allowedExt = /mp4|webm|mov|avi/;
  const ext = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mime = /^video\//.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only video files (mp4, webm, mov, avi)'), false);
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB for video

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
});

const uploadImage = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadPost = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    const isImage = /^image\//.test(file.mimetype) || /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase());
    const isVideo = /^video\//.test(file.mimetype) || /mp4|webm|mov|avi/.test(path.extname(file.originalname).toLowerCase());
    if (isImage || isVideo) cb(null, true);
    else cb(new Error('Only image or video files allowed'), false);
  },
});

module.exports = {
  upload,
  uploadImage,
  uploadPost,
  single: (field) => uploadImage.single(field),
};
