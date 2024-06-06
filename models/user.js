const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: [3, 'Minimum name length is 3 characters'],
        },
        lastName: {
            type: String,
            default: null,
            minlength: [3, 'Minimum name length is 3 characters'],
        },
        email: {
            type: String,
            lowercase: true,

            validate: [
                {
                    validator: function (value) {
                        // Make email required if googleId is not present
                        return this.googleId || isEmail(value);
                    },
                    message: 'Please enter a valid email',
                },
                {
                    validator: function (value) {
                        // Ensure email is unique if provided
                        return !this.googleId || value;
                    },
                    message: 'Email is required',
                },
            ],
            unique: true,
        },
        password: {
            type: String,

            required: function () {
                // Make password required if googleId is not present
                return !this.googleId;
            },
            errorMessage: 'Password is required',
        },
        googleId: {
            type: String,
            default: null,
        },
        subscription: {
            type: String,
            enum: ['free', 'Gold', 'Premium', 'admin'],
            default: 'free',
            errorMessage: 'Invalid subscription type',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        chats: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Chat',
            },
        ],
        starMessages: [
            {
                messageID: mongoose.Schema.Types.ObjectId,
                chatID: mongoose.Schema.Types.ObjectId,
            },
        ],
        uploadRequest: {
            type: Number,
            default: 0,
        },
        maxUploadRequest: {
            type: Number,
            default: 2, // Default value for free subscription -- change if the user has a different subscription
        },
        queryRequest: {
            type: Number,
            default: 0,
        },
        queryMax: {
            type: Number,
            default: 5, // Default value for free subscription -- change if the user has a different subscription
        },
    },
    {
        timestamps: true,
    }
);

// Function to reset the numbers
userSchema.methods.resetNumbers = function () {
    this.uploadRequest = 0; // Reset uploadRequest
};

// Middleware to automatically reset numbers before saving
userSchema.pre('save', async function (next) {
    const now = new Date();

    // Calculate 11:59 pm in the user's local time
    const resetTime = new Date(now);
    resetTime.setHours(23, 59, 0, 0);

    // Check if it's past 11:59 pm in the user's local time
    if (now > resetTime) {
        this.resetNumbers();
    }

    next();
});

module.exports = mongoose.model('User', userSchema);
