const User = require('../models/User');
const bcrypt = require('bcrypt');
const OTPModel = require('../models/OTP');
const { generateToken } = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailUtils');
const { generateOTP } = require('../utils/generateOTP');
const { validateEmail } = require('../utils/emailValidation');
const catchAsync = require('../utils/catchAsync');
const { createS3Folder } = require('../services/aws');
const passport = require('passport');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');


// Signup Controller
exports.signup = catchAsync(async (req, res , next) => {

    const session = await mongoose.startSession();

    try{

      
        session.startTransaction(session.defaultTransactionOptions);

        const { firstName, lastName, email, password } = req.body;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        

        // Create a folder for the user in the S3 bucket
        try {
            await createS3Folder(user._id.toString());
        } catch (error) {
            console.error('Signup -- Creating S3 Folder -- Error:', error);
            await User.findByIdAndDelete(user._id);

            next(new AppError('Failed to create S3 folder', 500));
        }

        // ------- OTP Phase ------
        const otp = generateOTP();

        try{

            await sendOTPEmail(email,otp)

        }catch(err){

            return next(new AppError("Failed to send OTP Email", 500))
        }

        const otpDocument = new OTPModel({
            email,
            otp,
        });

        await otpDocument.save({session});
        await user.save({session});

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            data: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                token: generateToken({ _id: user._id })
            },
        });
    }finally{
        session.endSession();
    }
});



// Login Controller
exports.login = catchAsync(async (req, res,next) => {
    const { email, password } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
        next(new AppError('invalid email format' , 400))
    }

    const user = await User.findOne({ email });
    if (!user) {
       next(new AppError('User not Found' , 404))
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        next(new AppError('User not Found' , 404))
    }

    res.status(200).json({
        status: 'success',
        email : user.email ,
        firstName : user.firstName ,
        token: generateToken({ _id: user._id }),
    });
});


// Resend OTP Controller
exports.resendOtp = catchAsync(async (req, res) => {
    const { email } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        next(new AppError('There is no user with email address.', 404));
    }

    // delete any existing OTP on this email
    await OTPModel.deleteOne({
        email,
    });

    const otp = generateOTP();
    sendOTPEmail(email, otp);

    const otpDocument = new OTPModel({
        email,
        otp,
    });

    await otpDocument.save();
    res.status(200).json({ 
        status: 'success',
        message: 'OTP sent successfully.' 
    });
});

// Verify OTP Controller
exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { email } = req.user;

    const otpDocument = await OTPModel.findOne({ email });

    if (!otpDocument) {
        next(new AppError('OTP not found', 404));
    }

    if (otpDocument.otp !== req.body.otp) {
        next(new AppError('Invalid OTP', 400));
    }

    const user = await User.findOne({ email });
    user.isVerified = true;
    await user.save();

    // Delete the OTP document
    await OTPModel.deleteOne({ _id: otpDocument._id });

    const token = generateToken({ _id: user._id });
    res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token,
    });
});

exports.logOut = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};



exports.forgetPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    // Get the user based on posted email
    const user = await User.findOne({ email });
    if (!user) {
        next(new AppError('There is no user with email address.', 404));
    }

    const otp = generateOTP();
    await sendOTPEmail(email, otp);

    const otpDocument = new OTPModel({
        email,
        otp,
    });
    otpDocument.save();

    res.status(200).json({ status: 'success' });
});



exports.setNewPassword = catchAsync(async (req, res, next) => {
    // after the user verification the otp
    const { email } = req.user;
    const {newPassword, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        next(new AppError('Invalid email. Or user not found', 404));
    }

    const otpDocument = await OTPModel.findOne({ email });

    if (!otpDocument || otpDocument.otp !== otp) {
        next(new AppError('Invalid OTP', 404));
    }

    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    await user.save();
    

    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully.',
    });
});


exports.resetPassword = catchAsync(async (req, res) => {
    // get the old password and compare it with the new password
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        next(new AppError('Invalid email. Or user not found', 404));
    }

    const isMatch = bcrypt.compareSync(oldPassword, user.password);

    if (!isMatch) {
        return next(new AppError('Invalid old password', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'password reset successfully',
    });
});


/// ALL About Google Auth
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.redirect('/auth/google/failure');
        }

        console.log(user);
        const token = generateToken({ _id: user._id });
        res.redirect(`/api/user/auth/google/success?token=${token}&email=${user.email}&firstName=${user.firstName}`); // Using query string
    })(req, res, next);
};

exports.googleAuthFailure = (req, res) => {
    res.status(401).json({
        status: 'fail',
        message: 'Google authentication failed.',
    });
};

exports.googleAuthSuccess = (req, res) => {
    const {token} = req.query // Use query parameter
    const {email} = req.query
    const {firstName} = req.query

    res.status(200).json({
        status: 'success',
        message: 'Google authentication successful.',
        token,
        email,
        firstName
    });
};
