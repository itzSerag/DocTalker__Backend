const express = require('express');
const router = express.Router();
const controller = require('../controllers/extractionController');

// extract a text from a webpage
router.post('/extract-webpage', controller.extractWebpage);
router.post('/extract-youtube', controller.extractYoutube);

module.exports = router;