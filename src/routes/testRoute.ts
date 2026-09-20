import { Router } from 'express';
import { test, testWithAuth } from '../controllers/testController';
import { auth } from '../middlewares/auth';

const router = Router();

// Public health check
router.get('/', test);

// Protected test endpoint
router.get('/auth', auth, testWithAuth);

export default router;
