import { Router } from 'express';
import { fileUpload, folderUpload } from '../controllers/uploadController';
import processController from '../controllers/processController';
import { upload } from '../utils/uploadFile';
import { auth } from '../middlewares/auth';
import { checkUploadRequest, checkFileType } from '../middlewares/isAuthorized';
import { isUserValid } from '../middlewares/userChecks/isValid';

const router = Router();

// Single file upload
router.post('/upload', auth, isUserValid, checkUploadRequest, upload.single('file'), checkFileType, fileUpload);

// Folder / multi-file upload
router.post('/uploadfolder', auth, isUserValid, checkUploadRequest, upload.array('files'), folderUpload);

// Trigger processing and embeddings generation for a document
router.post('/process', auth, isUserValid, processController.handler);

export default router;
