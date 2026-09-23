import { Router } from 'express';
import {
    createChat,
    getAllChats,
    getChat,
    getChatFile,
    deleteChat,
    updateChat,
    starMessage,
    unStarMessage,
    getStarredMessages,
} from '../controllers/chatController';
import { auth } from '../middlewares/auth';
import { isUserValid } from '../middlewares/userChecks/isValid';

const router = Router();

router.use(auth);
router.use(isUserValid);

// Starred messages
router.get('/getAllStarred', getStarredMessages);
router.post('/star', starMessage);
router.post('/unStar', unStarMessage);

// Chats collection
router.get('/', getAllChats);
router.post('/', createChat);

// Specific chat operations
router.get('/:id', getChat);
router.get('/:id/files/:fileIndex', getChatFile);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);

export default router;
