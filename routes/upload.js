const express = require('express');
const { fileUpload, folderUpload } = require('../controllers/uploadController');
const processController = require('../controllers/processController');
const { upload } = require('../utils/uploadFile');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Handle single file upload
router.post('/upload', auth, upload.single('file'), fileUpload);

// Handle folder upload
router.post('/uploadfolder', auth, upload.array('files'), folderUpload);

// Handle processing
router.post('/process', auth, processController.handler);

module.exports = router;
