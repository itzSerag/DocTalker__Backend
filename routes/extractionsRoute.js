const express = require('express');
const router = express.Router();
const controller = require('../controllers/extractionsController');
const { auth } = require('../middlewares/auth');
const isUserValid = require('../middlewares/userChecks/isValid');

// extract a text from a webpage
router.post('/extract-content', auth, isUserValid,controller.extractContent);

module.exports = router;
