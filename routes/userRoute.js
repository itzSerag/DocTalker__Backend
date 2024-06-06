const express = require('express');
const router = express.Router();
const { deleteUser, updateUser, me } = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const controller = require('../controllers/authController');

// public routes
router.post('/login', controller.login);
router.post('/signup', controller.signup);

router.delete('/', auth, deleteUser);
router.put('/', auth, updateUser);
router.get('/verifyToken', auth, (req, res) => {
    res.status(200).json({ message: 'Token is valid' });
});
router.get('/me', auth, me);

//TODO OTP AUTH
router.post('/otp/verify', auth, controller.verifyOtp);
router.post('/otp/resend', auth, controller.resendOtp);
router.post('/resetPassword', auth, controller.resetPassword);

// Google Auth
router.get('/auth/google', controller.googleAuth);
router.get('/auth/google/callback', controller.googleAuthCallback);
router.get('/auth/google/success', controller.googleAuthSuccess);
router.get('/auth/google/failure', controller.googleAuthFailure);

module.exports = router;
