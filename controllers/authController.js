// authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const OTPModel = require('../models/OTP');
const { generateToken } = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailUtils');
const { generateOTP } = require('../utils/generateOTP');
const { validateEmail } = require('../utils/emailVaildation');
const catchAsync = require('../utils/catchAsync');
const { createS3Folder } = require('../services/aws');

// Signup Controller
exports.signup = catchAsync(async (req, res) => {
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

    // Save the user
    await user.save();

    // Create a folder for the user in the S3 bucket
    try {
        await createS3Folder(user._id.toString());
    } catch (error) {
        console.error('Signup -- Creating S3 Folder -- Error:', error);
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
            status: 'fail',
            error: 'Failed to create a folder for the user.',
        });
    }

    // OTP Phase
    const otp = generateOTP();
    const otpExpiresIn = new Date(Date.now() + 20 * 60 * 1000);

    try {
        await sendOTPEmail(email, otp);
    } catch (error) {
        await User.findByIdAndDelete(user._id);
        console.error('Signup Error:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }

    const otpDocument = new OTPModel({
        email,
        otp,
    });

    await otpDocument.save();

    res.status(200).json({
        status: 'success',
        data: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            token: generateToken({ _id: user._id }),
            otp: {
                otp,
                otpExpiresIn,
            },
        },
    });
});

// Login Controller
exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password.' });
    }

    res.status(200).json({
        ...user._doc,
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
        return res.status(400).json({ error: 'User not found.' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await sendOTPEmail(email, otp);

    const otpDocument = new OTPModel({
        email,
        otp,
    });

    await otpDocument.save();

    res.status(200).json({ message: 'OTP sent successfully.' });
});



// Verify OTP Controller
exports.verifyOtp = catchAsync(async (req, res) => {

    const {email} = req.user;

    const otpDocument = await OTPModel.findOne({ email });

    if (!otpDocument) {
        return res.status(400).json({ error: 'No OTP found for the provided email.' });
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
        return res.status(404).json({ error: 'Invalid email.' });
    }

    const otp = generateOTP();
    await sendOTPEmail(email, otp);

    const otpDocument = new OTPModel({
        email,
        otp,
    });

    otpDocument.save();
    res.status(200).json({ status: 'OTP sent successfully.' });
});



exports.resetPassword = catchAsync(async (req, res) => {

    // get the old password and compare it with the new password
    const {email , oldPassword, newPassword} = req.body;

    const user = await User.findOne({ email});
    if (!user) {
        return res.status(404).json({ error: 'Invalid email. Or user not found' });

    }

    const isMatch = bcrypt.compareSync(oldPassword, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password.' });
    }

    // Hash the password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ 
        status: 'success',
        message : "password resset successfully"
     });


});
