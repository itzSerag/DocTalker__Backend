import { Router } from 'express';
import {
  createCheckoutSession,
  paymentSuccess,
  paymentCancel,
} from '../controllers/paymentController';
import { auth } from '../middlewares/auth';
import { validateStripeID } from '../middlewares/idChecks/validateStripeID';
import { paymentsCheck } from '../middlewares/paymentsCheck';
import { isUserValid } from '../middlewares/userChecks/isValid';

const router = Router();

// Initiate checkout
router.post(
  '/process-payment',
  auth,
  isUserValid,
  paymentsCheck,
  createCheckoutSession
);

// Payment callbacks
router.get('/success', validateStripeID, paymentSuccess);
router.get('/cancel', validateStripeID, paymentCancel);

export default router;
