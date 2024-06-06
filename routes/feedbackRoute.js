const express = require('express');
const router = express.Router();

const controller = require('../controllers/feedbackController');
const { auth } = require('../middlewares/auth');
const isUserValid = require('../middlewares/userChecks/isValid');

// extract a text from a webpage
router.post('/feedbackmessage', auth, isUserValid, controller.feedbackController);

module.exports = router;
