const express = require('express');
const router = express.Router();

const { auth } = require('../middlewares/auth');
const isUserValid = require('../middlewares/userChecks/isValid');


const {
    getAllChats,
    getChat,
    deleteChat,
    updateChat,
    startMessage,
    unstartMessage,
} = require('../controllers/chatController');

// TODO : ADD AUTH MIDDLEWARE

// for testing only -- Chat CRUD Operations
router.use(auth);
router.get('/:id', getChat);
router.get('/', getAllChats);
router.delete('/:id', deleteChat);
router.put('/:id', updateChat);

router.post('/star', auth , isUserValid,startMessage);
router.post('/unstar', auth ,isUserValid, unstartMessage);

module.exports = router;
