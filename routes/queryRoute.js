const express = require('express');
const queryController = require('../controllers/queryController'); // Update the path
const { auth } = require('../middlewares/auth');
const idChatCheck = require('../middlewares/idChecks/chatCheck'); // Update the path
const isUserValid = require('../middlewares/userChecks/isValid');
const router = express.Router();


// process the query coming from the user
router.post('/query-process', auth, isUserValid,idChatCheck, queryController.handler);

module.exports = router;
