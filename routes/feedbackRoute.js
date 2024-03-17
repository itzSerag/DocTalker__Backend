const express = require('express');
const router = express.Router();

const controller = require('../controllers/feedbackController');

// extract a text from a webpage
router.post('/sendFeedbackMessage', controller.feedbackController);

module.exports = router;
