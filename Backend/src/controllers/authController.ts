import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User';
import OTP from '../models/OTP';
import { generateToken } from '../utils/generateToken';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/emailUtils';
import { compareOTP, generateOTP, hashOTP } from '../utils/generateOTP';
import { validateEmail } from '../utils/emailValidation';
import catchAsync from '../utils/catchAsync';
import { createS3Folder } from '../services/aws';
import AppError from '../utils/appError';
import logger from '../utils/logger';
import { setAuthCookie, clearAuthCookie } from '../utils/cookieUtils';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const OTP_TTL_MS = 20 * 60 * 1000;

const consumeOtpAttempt = async (otpId: unknown) =>
    OTP.findOneAndUpdate({ _id: otpId, attempts: { $lt: 5 } }, { $inc: { attempts: 1 } }, { new: true });

// Signup Controller
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, password } = req.body;
    const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';

    if (!firstName || !email || !password) {
        return next(new AppError('Please provide firstName, email, and password', 400));
    }

    if (typeof firstName !== 'string' || firstName.trim().length < 3) {
        return next(new AppError('First name must be at least 3 characters long', 400));
    }

    if (typeof password !== 'string' || password.length < 8) {
        return next(new AppError('Password must be at least 8 characters long', 400));
    }

    if (!validateEmail(email)) {
        return next(new AppError('Invalid email format', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('User with this email already exists', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
        firstName,
        lastName: lastName || '',
        email,
        password: hashedPassword,
    });

    await user.save();

    // Create an S3 folder for the user (non-blocking failure with warning)
    try {
        await createS3Folder(user._id.toString());
    } catch (error: any) {
        logger.warn({ err: error, userId: user._id }, `Signup | Warning: Failed to create S3 folder: ${error.message}`);
    }

    // Generate and send OTP
    const otpCode = generateOTP();
    try {
        await sendOTPEmail(email, otpCode, firstName);
    } catch (err: any) {
        logger.error({ err, email }, `Failed to send OTP email during signup: ${err.message}`);
        // User is created; they can use resend OTP
    }

    await OTP.deleteMany({ email, purpose: 'verification' });
    const otpDocument = new OTP({
        email,
        otp: hashOTP(otpCode),
        purpose: 'verification',
    });
    await otpDocument.save();

    const token = generateToken({ _id: user._id });
    setAuthCookie(res, token);

    return res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Verification OTP sent to email.',
        data: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            token,
        },
    });
});

// Login Controller
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';

    if (!email || !password) {
        return next(new AppError('Please provide both email and password', 400));
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        return next(new AppError('Please provide a valid email and password', 400));
    }

    if (!validateEmail(email)) {
        return next(new AppError('Invalid email format', 400));
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        return next(new AppError('Incorrect email or password', 401));
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Block unverified users – they must complete email verification first
    if (!user.isVerified) {
        const tempToken = generateToken({ _id: user._id });
        setAuthCookie(res, tempToken);
        return res.status(403).json({
            status: 'fail',
            needsVerification: true,
            message: 'Please verify your email address before signing in.',
            email: user.email,
        });
    }

    const token = generateToken({ _id: user._id });
    setAuthCookie(res, token);

    return res.status(200).json({
        status: 'success',
        email: user.email,
        firstName: user.firstName,
        token,
    });
});

// Resend OTP Controller
export const resendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email || (typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : '');

    if (!email || !validateEmail(email)) {
        return next(new AppError('Invalid or missing email address', 400));
    }

    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
        return res.status(200).json({
            status: 'success',
            message: 'If the account can be verified, a new code has been sent.',
        });
    }

    await OTP.deleteMany({ email, purpose: 'verification' });

    const otpCode = generateOTP();
    await sendOTPEmail(email, otpCode, user.firstName);

    const otpDoc = new OTP({
        email,
        otp: hashOTP(otpCode),
        purpose: 'verification',
    });
    await otpDoc.save();

    return res.status(200).json({
        status: 'success',
        message: 'New OTP sent successfully to your email.',
    });
});

// Verify OTP Controller
export const verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email || (typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : '');
    const { otp } = req.body;

    if (!email || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
        return next(new AppError('Email and OTP are required', 400));
    }

    const otpDocument = await OTP.findOne({ email, purpose: 'verification' });
    if (!otpDocument) {
        return next(new AppError('OTP expired or not found. Please request a new one.', 404));
    }

    if (Date.now() - new Date(otpDocument.createdAt || 0).getTime() >= OTP_TTL_MS) {
        await OTP.deleteOne({ _id: otpDocument._id });
        return next(new AppError('OTP expired or not found. Please request a new one.', 404));
    }

    const attemptedOtp = await consumeOtpAttempt(otpDocument._id);
    if (!attemptedOtp) {
        await OTP.deleteOne({ _id: otpDocument._id });
        return next(new AppError('Too many incorrect attempts. Please request a new OTP.', 429));
    }

    if (!compareOTP(otpDocument.otp, otp)) {
        if ((attemptedOtp.attempts ?? 1) >= 5) {
            await OTP.deleteOne({ _id: otpDocument._id });
            return next(new AppError('Too many incorrect attempts. Please request a new OTP.', 429));
        }
        return next(
            new AppError(`Invalid OTP code. ${Math.max(0, 5 - (attemptedOtp.attempts ?? 1))} attempts remaining.`, 400)
        );
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    user.isVerified = true;
    await user.save();

    await OTP.deleteMany({ email, purpose: 'verification' });

    // Send welcome email in background
    sendWelcomeEmail(user.email, user.firstName).catch((err) => {
        logger.warn({ err, email: user.email }, 'Failed to send welcome email upon verification');
    });

    const token = generateToken({ _id: user._id });
    setAuthCookie(res, token);

    return res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token,
        },
    });
});

// Logout
export const logOut = (_req: Request, res: Response): void => {
    clearAuthCookie(res);
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// Forgot Password
export const forgetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';

    if (!email || !validateEmail(email)) {
        return next(new AppError('Please provide a valid email address', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json({
            status: 'success',
            message: 'If an account exists for this email, a password reset code has been sent.',
        });
    }

    const otpCode = generateOTP();
    await sendOTPEmail(email, otpCode, user.firstName);

    await OTP.deleteMany({ email, purpose: 'password_reset' });
    const otpDoc = new OTP({
        email,
        otp: hashOTP(otpCode),
        purpose: 'password_reset',
    });
    await otpDoc.save();

    return res.status(200).json({
        status: 'success',
        message: 'Password reset OTP sent to email.',
    });
});

// Set New Password with OTP
export const setNewPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email || (typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : '');
    const { newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
        return next(new AppError('Email, newPassword, and otp are required', 400));
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return next(new AppError('Password must be at least 8 characters long', 400));
    }

    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
        return next(new AppError('A valid 6-digit OTP is required', 400));
    }

    const otpDoc = await OTP.findOne({ email, purpose: 'password_reset' });
    if (!otpDoc || Date.now() - new Date(otpDoc.createdAt || 0).getTime() >= OTP_TTL_MS) {
        return next(new AppError('Invalid or expired OTP', 400));
    }

    const attemptedOtp = await consumeOtpAttempt(otpDoc._id);
    if (!attemptedOtp) {
        await OTP.deleteOne({ _id: otpDoc._id });
        return next(new AppError('Too many incorrect attempts. Please request a new OTP.', 429));
    }
    if (!compareOTP(otpDoc.otp, otp)) {
        if ((attemptedOtp.attempts ?? 1) >= 5) {
            await OTP.deleteOne({ _id: otpDoc._id });
            return next(new AppError('Too many incorrect attempts. Please request a new OTP.', 429));
        }
        return next(new AppError('Invalid or expired OTP', 400));
    }

    const consumedOtp = await OTP.findOneAndDelete({ _id: otpDoc._id, attempts: attemptedOtp.attempts });
    if (!consumedOtp) {
        return next(new AppError('Invalid or expired OTP', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Invalid or expired OTP', 400));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
        status: 'success',
        message: 'Password updated successfully.',
    });
});

// Reset Password (with old password)
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email || (typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : '');
    const { oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return next(new AppError('Please provide email, oldPassword, and newPassword', 400));
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return next(new AppError('Password must be at least 8 characters long', 400));
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        return next(new AppError('User not found or uses social login', 404));
    }

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
        return next(new AppError('Incorrect current password', 400));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
        status: 'success',
        message: 'Password changed successfully.',
    });
});

// Google Auth Handlers
export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleAuthCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err: any, user: any) => {
        if (err || !user) {
            return res.redirect('/api/user/auth/google/failure');
        }

        const token = generateToken({ _id: user._id });
        setAuthCookie(res, token);

        // Redirect to frontend app
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/app`);
    })(req, res, next);
};

export const googleAuthFailure = (_req: Request, res: Response): void => {
    res.status(401).json({
        status: 'fail',
        message: 'Google authentication failed.',
    });
};

export const googleAuthSuccess = (req: Request, res: Response): void => {
    const { token, email, firstName } = req.query;

    res.status(200).json({
        status: 'success',
        message: 'Google authentication successful.',
        token,
        email,
        firstName,
    });
};

export default {
    signup,
    login,
    resendOtp,
    verifyOtp,
    logOut,
    forgetPassword,
    setNewPassword,
    resetPassword,
    googleAuth,
    googleAuthCallback,
    googleAuthFailure,
    googleAuthSuccess,
};
