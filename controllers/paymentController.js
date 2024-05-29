const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PaymentModel = require('../models/Payment');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.createCheckoutSession = async (req, res) => {
    const { productName: name, price, user: currUser } = req;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // only card payments for now
            client_reference_id: currUser._id,
            line_items: [{
                price_data: {
                    currency: 'usd', // USD for now
                    product_data: {
                        name: name + " Subscription",
                    },
                    unit_amount: price * 100, // in cents  
                },
                quantity: 1,
            }],
            customer_email: currUser.email,
            metadata: {
                subscription_name: name,
            },
            mode: 'payment',
            success_url: "http://localhost:5000/api/payment/success?id={CHECKOUT_SESSION_ID}",
            cancel_url: 'http://localhost:5000/api/payment/cancel?id={CHECKOUT_SESSION_ID}',
        });

        const payment = new PaymentModel({
            user: currUser._id,
            amount: price,
            product: name,
            session_id: session.id,
        });

        await payment.save();

        res.json({ session });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};



exports.paymentSuccess = async (req, res) => {
    const { id } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(id);
        const subscription = session.metadata.subscription_name;

        const payment = await PaymentModel.findOne({ session_id: id }).populate('user');
        // now payment can access user data using payment.user

        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }


        let queryMax = 0;
        let maxUploadRequest = 0;

        console.log('subscription:', subscription);
        if (subscription === 'Gold') {
            queryMax = 200;
            maxUploadRequest = 30;
            // set the subscription expires date after 30 days from now
            payment.subscription_Expires_Date = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

        } else if (subscription === 'Premium') {
            queryMax = 500;
            maxUploadRequest = 50;
            // set the subscription expires date after 90 days from now
            payment.subscription_Expires_Date = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
        }

        await payment.save();

        await User.updateOne({ _id: payment.user._id }, {
            $set: {
                subscription,
                queryMax,
                maxUploadRequest
            }
        });

        res.json({
            status: "success",
            message: 'Payment successful',

        });
    } catch (error) {
        console.error('Error handling payment success:', error);
        next(new AppError('Error handling payment success', 500));
    }
};


exports.paymentCancel = async (req, res) => {
    res.json({
        status: "failed",
        message: 'Payment failed',
    });
};
