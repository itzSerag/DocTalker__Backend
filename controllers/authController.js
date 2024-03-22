// authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const OTP = require('../models/OTP');
const { generateToken } = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailUtils');
const { generateOTP } = require('../utils/generateOTP');
const { validateEmail } = require('../utils/emailVaildation');
const catchAsync = require('../utils/catchAsync');

const { createS3Folder } = require('../services/aws');

exports.signup = catchAsync(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create (Add) a new user
    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });

    // Create a folder for the user in the S3 bucket
    await createS3Folder(user._id.toString()).catch((error) => {
        console.error('Signup -- Creating S3 Folder -- Error:', error);

        res.status(500).json({
            status: 'fail',
            error: 'Failed to create a folder for the user.',
        });
    });

    await user.save().then(() => {
        res.status(200).json({
            status: 'success',
            data: {
                ...user._doc,
                token: generateToken({ _id: user._id }),
            },
        });
    });

    // TODO : MAKE OTP WORK

    // // Generate and store OTP
    // const otp = generateOTP();
    // const otpExpiresIn = new Date(Date.now() + 20 * 60 * 1000);
    // console.log(otp, otpExpiresIn);

    // await sendOTPEmail(email, otp)
    //     .then(() => {
    //         // sent successfully
    //         // TODO: filter the user object before sending it to the client
    //     })
    //     .catch((error) => {
    //         User.findByIdAndDelete(user._id).then(() => {
    //             console.error('Signup Error:', error);
    //             res.status(500).json({ error: 'Failed to send OTP' });
    //         });
    //     });

    // const otpDocument = new OTP({
    //     email,
    //     otp,
    //     otpExpiresIn,
    // });

    // await otpDocument.save();
});

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

    // Dont send the password to the client
    res.status(200).json({ ...user._doc, token: generateToken({ _id: user._id }) });
});



exports.resendOtp = async (req, res) => {
    try {
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
        const otpExpiresIn = new Date(Date.now() + 20 * 60 * 1000);

        // Send OTP email
        await sendOTPEmail(email, otp);

        // Update the OTP document insted of deleteing it
        const otpDocument = await OTP.findOne({ email });
        otpDocument.otp = otp;
        otpDocument.otpExpiresIn = otpExpiresIn;
        await otpDocument.save();

        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('OTP Resend Error:', error);
        res.status(500).json({ error: 'Unexpected error during OTP resend.' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const otpDocument = await OTP.findOne({ email });

    if (!otpDocument) {
        return res.status(400).json({ error: 'No OTP found for the provided email.' });
    }

    // handle OTP expiry
    if (otpDocument.otp !== otp || otpDocument.otpExpiresIn < new Date(Date.now())) {
        return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Mark the user as verified
    const user = await User.findOne({ email });
    user.isVerified = true;
    await user.save();

    // now user can login

    // Delete the OTP document
    await OTP.deleteOne({ _id: otpDocument._id });

    // Generate and return the JWT token using the existing function
    const token = generateToken({ _id: user._id });
    // update the token

    res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: token,
    });
};

// TODO : SHEKIB -- >

exports.logOut = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};

exports.forgetPassword = async (req, res, next) => {
    //1. Get the user based on posted email
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            const error = new CustomError('Invalid', 404);
            next(error);
        }
        const otp = generateOTP();
        const otpExpiresIn = new Date(Date.now() + 20 * 60 * 1000);
        await sendOTPEmail(email, otp);
        const otpDocument = await OTP.findOne({ email });
        otpDocument.otp = otp;
        otpDocument.otpExpiresIn = otpExpiresIn;
        await otpDocument.save();
        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Unexpected error during OTP send.' });
    }
};

exports.forgetPasswordSubmit = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const otpDocument = await OTP.findOne({ email });
        if (!otpDocument) {
            return res.status(400).json({ error: 'No OTP found for the provided email.' });
        }

        // handle OTP expiry and wrong otp
        if (otpDocument.otp !== otp || otpDocument.otpExpiresIn < new Date(Date.now())) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unexpected error during OTP verify.' });
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findOneAndUpdate(email, { password: hashedPassword });
        res.status(200).json({ message: 'User Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unexpected error during password reset' });
    }
};
// Other necessary imports and functions (e.g., generateOTP) go here
