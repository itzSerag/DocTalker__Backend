import { Router } from 'express';
import { handler as queryHandler, streamHandler } from '../controllers/queryController';
import { auth } from '../middlewares/auth';
import { chatCheck } from '../middlewares/idChecks/chatCheck';
import { isUserValid } from '../middlewares/userChecks/isValid';
import { checkQueryRequest } from '../middlewares/isAuthorized';

const router = Router();

router.post('/query-process', auth, isUserValid, chatCheck, checkQueryRequest, queryHandler);
router.post('/query-stream', auth, isUserValid, chatCheck, checkQueryRequest, streamHandler);

export default router;
