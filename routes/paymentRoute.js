const express = require('express');
const controller = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');
const  paymentCheck  = require('../middlewares/paymentsCheck');
const router = express.Router();

// Process a payment
router.post('/process-payment',auth , paymentCheck, controller.createCheckoutSession);
router.get('/success' ,controller.paymentSucess);
router.get('/cancel' ,controller.paymentCancel);


module.exports = router;
