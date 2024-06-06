// make the otp model

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1200,
    },
});

module.exports = mongoose.model('OTP', otpSchema);
