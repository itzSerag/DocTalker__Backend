const express = require('express');
const controller = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');
const  paymentCheck  = require('../middlewares/paymentsCheck');
const router = express.Router();

// Process a payment
router.post('/process-payment',auth , paymentCheck, controller.createCheckoutSession);

// webhook - success intent

// router.post('/webhook', auth, controller.paymentSucess);

module.exports = router;
