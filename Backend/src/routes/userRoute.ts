import { Router } from 'express';
import {
    signup,
    login,
    forgetPassword,
    verifyOtp,
    resendOtp,
    resetPassword,
    setNewPassword,
    logOut,
    googleAuth,
    googleAuthCallback,
    googleAuthSuccess,
    googleAuthFailure,
} from '../controllers/authController';
import { me, updateUser, deleteUser } from '../controllers/userController';
import { auth } from '../middlewares/auth';

const router = Router();

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgetPassword', forgetPassword);
router.post('/setNewPassword', setNewPassword);
router.get('/logout', logOut);

// Google OAuth
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);
router.get('/auth/google/success', googleAuthSuccess);
router.get('/auth/google/failure', googleAuthFailure);

// Protected user routes
router.use(auth);

router.get('/me', me);
router.put('/', updateUser);
router.delete('/', deleteUser);
router.get('/verifyToken', (_req, res) => {
    res.status(200).json({ status: 'success', message: 'Token is valid' });
});

router.post('/otp/verify', verifyOtp);
router.post('/otp/resend', resendOtp);
router.post('/resetPassword', resetPassword);

export default router;
