const express = require('express');
const router = express.Router();

const { auth } = require('../middlewares/auth');
const isUserValid = require('../middlewares/userChecks/isValid');

const {
    getAllChats,
    getChat,
    deleteChat,
    updateChat,
    starMessage,
    unStarMessage,
} = require('../controllers/chatController');

// TODO : ADD AUTH MIDDLEWARE

// for testing only -- Chat CRUD Operations
router.use(auth);
router.use(isUserValid);
router.get('/:id', getChat);
router.get('/', getAllChats);
router.delete('/:id', deleteChat);
router.put('/:id', updateChat);

router.post('/star',starMessage);
router.post('/unStar', unStarMessage);

module.exports = router;
