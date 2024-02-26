const express = require('express');
const uploadController = require('../controllers/uploadController');
const processController = require('../controllers/processController');
const { upload } = require('../utils/uploadFile');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Handle single file upload
router.post("/upload", auth, upload.single("file"), uploadController.handler);

// Handle folder upload
router.post("/uploadfolder", upload.array("files" ,5), uploadController.handler);


// Handle processing
router.post("/process", auth, processController.handler);

module.exports = router;
