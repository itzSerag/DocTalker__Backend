import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User';
import OTP from '../models/OTP';
import { generateToken } from '../utils/generateToken';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/emailUtils';
import { generateOTP } from '../utils/generateOTP';
import { validateEmail } from '../utils/emailValidation';
import catchAsync from '../utils/catchAsync';
import { createS3Folder } from '../services/aws';
import AppError from '../utils/appError';
import logger from '../utils/logger';
import { setAuthCookie, clearAuthCookie } from '../utils/cookieUtils';

// Signup Controller
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
        return next(new AppError('Please provide firstName, email, and password', 400));
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

    await OTP.deleteMany({ email });
    const otpDocument = new OTP({
        email,
        otp: otpCode,
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
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide both email and password', 400));
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
    const email = req.user?.email || req.body?.email;

    if (!email || !validateEmail(email)) {
        return next(new AppError('Invalid or missing email address', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('No user found with this email address', 404));
    }

    await OTP.deleteMany({ email });

    const otpCode = generateOTP();
    await sendOTPEmail(email, otpCode, user.firstName);

    const otpDoc = new OTP({
        email,
        otp: otpCode,
    });
    await otpDoc.save();

    return res.status(200).json({
        status: 'success',
        message: 'New OTP sent successfully to your email.',
    });
});

// Verify OTP Controller
export const verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email || req.body?.email;
    const { otp } = req.body;

    if (!email || !otp) {
        return next(new AppError('Email and OTP are required', 400));
    }

    const otpDocument = await OTP.findOne({ email });
    if (!otpDocument) {
        return next(new AppError('OTP expired or not found. Please request a new one.', 404));
    }

    // Increment attempt counter to prevent brute-force
    otpDocument.attempts = (otpDocument.attempts || 0) + 1;
    if (otpDocument.attempts > 5) {
        await OTP.deleteMany({ email });
        return next(new AppError('Too many incorrect attempts. Please request a new OTP.', 429));
    }
    await otpDocument.save();

    if (otpDocument.otp !== otp) {
        return next(new AppError(`Invalid OTP code. ${5 - otpDocument.attempts} attempts remaining.`, 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    user.isVerified = true;
    await user.save();

    await OTP.deleteMany({ email });

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
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
        return next(new AppError('Please provide a valid email address', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('No user found with that email address', 404));
    }

    const otpCode = generateOTP();
    await sendOTPEmail(email, otpCode, user.firstName);

    await OTP.deleteMany({ email });
    const otpDoc = new OTP({
        email,
        otp: otpCode,
    });
    await otpDoc.save();

    return res.status(200).json({
        status: 'success',
        message: 'Password reset OTP sent to email.',
    });
});

// Set New Password with OTP
export const setNewPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email || req.body?.email;
    const { newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
        return next(new AppError('Email, newPassword, and otp are required', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc || otpDoc.otp !== otp) {
        return next(new AppError('Invalid or expired OTP', 400));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await OTP.deleteMany({ email });

    return res.status(200).json({
        status: 'success',
        message: 'Password updated successfully.',
    });
});

// Reset Password (with old password)
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email || req.body?.email;
    const { oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return next(new AppError('Please provide email, oldPassword, and newPassword', 400));
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
