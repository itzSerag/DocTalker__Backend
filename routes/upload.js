const express = require('express');
const uploadController = require('../controllers/uploadController');
const processController = require('../controllers/processController');
const { upload } = require('../utils/uploadFile');
const { auth } = require('../middlewares/auth');
const multer = require('multer');

const router = express.Router();

// Handle single file upload
router.post("/upload", auth, upload.single("file"), uploadController.handler);


// Handle folder upload
router.post("/uploadfolder", auth, function(req, res, next) {
  // Use the multer array middleware to handle the folder upload
  upload.array('files')(req, res, function (err) {
    if(err){
        return res.status(400).json({ error: err.message });
    }
    // Files have been uploaded successfully -- deal with it using req.files
    next();
  });
}, uploadController.handler);

// Handle processing
router.post("/process", auth, processController.handler);

module.exports = router;