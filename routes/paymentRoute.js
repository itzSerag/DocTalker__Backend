const express = require('express');
const controller = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');
const idCheck = require('../middlewares/validateStripeID')
const  paymentCheck  = require('../middlewares/paymentsCheck');
const router = express.Router();

// Process a payment
router.post('/process-payment',auth , paymentCheck, controller.createCheckoutSession);
router.get('/success', idCheck , controller.paymentSuccess);
router.get('/cancel' , idCheck ,controller.paymentCancel);


module.exports = router;
