const express = require('express');
const router = express.Router();



const {
    getAllChats,
    getChat,
    deleteChat,
    updateChat,
    startMessage,
    unstartMessage,
} = require('../controllers/chatController');

const { auth } = require('../middlewares/auth');

// TODO : ADD AUTH MIDDLEWARE

// for testing only -- Chat CRUD Operations
router.use(auth);
router.get('/:id', getChat);
router.get('/', getAllChats);
router.delete('/:id', deleteChat);
router.put('/:id', updateChat);

router.post('/star', startMessage);
router.post('/unstar', unstartMessage);

module.exports = router;
