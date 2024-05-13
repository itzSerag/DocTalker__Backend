const express = require('express');
const controller = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Process a payment
router.post('/payment-checkout',auth, controller.createCheckoutSession);

module.exports = router;
