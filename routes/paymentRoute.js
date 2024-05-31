const express = require('express');
const controller = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');
const idCheck = require('../middlewares/idChecks/validateStripeID')
const  paymentCheck  = require('../middlewares/paymentsCheck');
const isUserValid = require('../middlewares/userChecks/isValid');
const router = express.Router();

// Process a payment
router.post('/process-payment',auth , isUserValid,paymentCheck, controller.createCheckoutSession);
router.get('/success', idCheck , isUserValid,controller.paymentSuccess);
router.get('/cancel' , idCheck ,isUserValid,controller.paymentCancel);


module.exports = router;
