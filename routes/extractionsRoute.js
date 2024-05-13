const express = require('express');
const router = express.Router();
const controller = require('../controllers/extractionsController');
const { auth } = require('../middlewares/auth');

// extract a text from a webpage
router.post('/extract-content', auth, controller.extractContent);

module.exports = router;
