const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.createCheckoutSession = async (req, res) => {
    const { product } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'US',
                        product_data: {
                            name: product.name,
                        },
                        unit_amount: product.price, // Assuming price is in paisa
                    },
                    quantity: product.quantity,
                },
            ],
            mode: 'payment',
            // success_url: 'http://localhost:3000/api/payment/success',
            // cancel_url: 'http://localhost:3000/api/payment/cancel',
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};
