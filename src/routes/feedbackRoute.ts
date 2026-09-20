import { Router } from 'express';
import { feedbackController } from '../controllers/feedbackController';
import { auth } from '../middlewares/auth';
import { isUserValid } from '../middlewares/userChecks/isValid';

const router = Router();

router.post(
  '/feedbackmessage',
  auth,
  isUserValid,
  feedbackController
);

export default router;
