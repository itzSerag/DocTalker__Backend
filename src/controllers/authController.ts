import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User';
import OTP from '../models/OTP';
import { generateToken } from '../utils/generateToken';
import { sendOTPEmail } from '../utils/emailUtils';
import { generateOTP } from '../utils/generateOTP';
import { validateEmail } from '../utils/emailValidation';
import catchAsync from '../utils/catchAsync';
import { createS3Folder } from '../services/aws';
import AppError from '../utils/appError';

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
    return next(new AppError('This email is already registered. Please log in.', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    firstName,
    lastName: lastName || null,
    email,
    password: hashedPassword,
  });

  await user.save();

  // Create an S3 folder for the user (non-blocking failure with warning)
  try {
    await createS3Folder(user._id.toString());
  } catch (error: any) {
    console.warn('Signup | Warning: Failed to create S3 folder during signup:', error.message);
  }

  // Generate and send OTP
  const otpCode = generateOTP();
  try {
    await sendOTPEmail(email, otpCode);
  } catch (err: any) {
    console.error('Failed to send OTP email:', err.message);
    // User is created; they can use resend OTP
  }

  await OTP.deleteMany({ email });
  const otpDocument = new OTP({
    email,
    otp: otpCode,
  });
  await otpDocument.save();

  const token = generateToken({ _id: user._id });

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

  const token = generateToken({ _id: user._id });

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
  await sendOTPEmail(email, otpCode);

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

  if (otpDocument.otp !== otp) {
    return next(new AppError('Invalid OTP code', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isVerified = true;
  await user.save();

  await OTP.deleteMany({ email });

  const token = generateToken({ _id: user._id });

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
  res.cookie('jwt', '', { maxAge: 1 });
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
  await sendOTPEmail(email, otpCode);

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
    const redirectUrl = `/api/user/auth/google/success?token=${token}&email=${encodeURIComponent(
      user.email
    )}&firstName=${encodeURIComponent(user.firstName)}`;

    return res.redirect(redirectUrl);
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
