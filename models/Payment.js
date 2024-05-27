// make payment schema

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // refers to the collection name
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    product: {
        type: String,
        required: true,
    },
    session_id: {
        type: String,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;