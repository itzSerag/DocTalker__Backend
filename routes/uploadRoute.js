const express = require('express');
const { fileUpload, folderUpload } = require('../controllers/uploadController');
const processController = require('../controllers/processController');
const { upload } = require('../utils/uploadFile');
const { auth } = require('../middlewares/auth');
const idChatCheck = require('../middlewares/idChecks/chatCheck');
const { checkUploadRequest, checkFileType } = require('../middlewares/isAuthorized');
const isUserValid = require('../middlewares/userChecks/isValid');

const router = express.Router();

// Handle single file upload
router.post('/upload', auth, isUserValid ,checkUploadRequest, upload.single('file'), checkFileType, fileUpload);

// Handle folder upload
router.post('/uploadfolder', auth, isUserValid,checkUploadRequest, upload.array('files'),  folderUpload);

// Handle processing
router.post('/process', auth, idChatCheck , isUserValid ,processController.handler);

module.exports = router;
