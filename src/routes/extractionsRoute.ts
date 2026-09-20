import { Router } from 'express';
import { extractContent } from '../controllers/extractionsController';
import { auth } from '../middlewares/auth';
import { isUserValid } from '../middlewares/userChecks/isValid';
import { checkUploadRequest } from '../middlewares/isAuthorized';

const router = Router();

router.post(
  '/extract-content',
  auth,
  isUserValid,
  checkUploadRequest,
  extractContent
);

export default router;
