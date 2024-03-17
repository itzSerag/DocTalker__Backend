const express = require('express');
const router = express.Router();

const controller = require('../controllers/feedbackController');
const { auth } = require('../middlewares/auth');

// extract a text from a webpage
router.post('/sendFeedbackMessage', auth, controller.feedbackController);

module.exports = router;
