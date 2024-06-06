const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { checkUploadRequest } = require('../middlewares/isAuthorized');
const controller = require('../controllers/handwrittenController');
const { upload } = require('../utils/uploadFile');

router.post('/uploadpdf', auth, checkUploadRequest, upload.single('file'), controller.uploadHandwrittenPDF);
// router.post('/uploadPic', auth, controller.uploadHandwrittenPic); // Future implementation

module.exports = router;
// Path: controllers/handwrittenController.js
