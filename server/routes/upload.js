const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const path = require('path');

router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const fileUrl = `${process.env.CLIENT_URL?.replace('5173', '5000') || 'http://localhost:5000'}/uploads/${req.file.filename}`;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(req.file.originalname);

  res.json({
    fileUrl,
    fileName: req.file.originalname,
    fileType: isImage ? 'image' : 'file',
    fileSize: req.file.size,
  });
});

module.exports = router;
