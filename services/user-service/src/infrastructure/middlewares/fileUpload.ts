import multer from 'multer';

// Set up Multer for file uploads
const upload = multer({
    dest: 'public/uploads/',
    limits: {
      fileSize: 10000000, // 10MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
        return cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
      }
      cb(null, true);
    },
  });

  export default upload