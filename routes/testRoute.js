const express = require('express');
const router = express.Router();

const {auth} = require('../middlewares/auth');

const controller = require('../controllers/testController');

// WITHOUT AUTH
router.get('/', controller.test);

// WITH AUTH
router.get('/auth', auth, controller.testWithAuth);

module.exports = router;