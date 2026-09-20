import { Router } from 'express';
import {
  uploadHandwrittenPDF,
  uploadHandwrittenPic,
} from '../controllers/handwrittenController';
import { auth } from '../middlewares/auth';
import { checkUploadRequest } from '../middlewares/isAuthorized';
import { upload } from '../utils/uploadFile';
import { isUserValid } from '../middlewares/userChecks/isValid';

const router = Router();

router.post(
  '/uploadpdf',
  auth,
  isUserValid,
  checkUploadRequest,
  upload.single('file'),
  uploadHandwrittenPDF
);

router.post(
  '/uploadPic',
  auth,
  isUserValid,
  checkUploadRequest,
  upload.single('file'),
  uploadHandwrittenPic
);

export default router;
