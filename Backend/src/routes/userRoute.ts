import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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
import { me, updateUser, deleteUser, sendTestMarketingEmail } from '../controllers/userController';
import { auth } from '../middlewares/auth';

const router = Router();

const authLimiter = rateLimit({
    max: 10, // 10 requests
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: {
        status: 'fail',
        message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const otpResendLimiter = rateLimit({
    max: 3, // 3 resend requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    message: {
        status: 'fail',
        message: 'Too many OTP resend requests. Please wait 15 minutes before trying again.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: { status: 'fail', message: 'Too many OTP attempts. Please wait 15 minutes and try again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public auth routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/forgetPassword', authLimiter, forgetPassword);
router.post('/setNewPassword', otpVerifyLimiter, setNewPassword);
router.post('/otp/verify', otpVerifyLimiter, verifyOtp);
router.post('/otp/resend', otpResendLimiter, resendOtp);
router.post('/resetPassword', resetPassword);
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
router.post('/marketing-email', sendTestMarketingEmail);

export default router;
