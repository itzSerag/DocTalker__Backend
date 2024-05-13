const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.createCheckoutSession = async (req, res) => {
    const { name } = req.body.product;
    const currUser = req.user;
    let price = null;

    if (!name) {
        return res.status(400).json({ error: 'Product name is required' });
    }

    if (name == 'premium') 
        {
    
        if (currUser.subscription === 'premium') {
            return res.status(400).json({ error: 'You are already subscribed to premium' });
        }
    }

    if(name == 'gold') 
        {
        if (currUser.subscription === 'gold') {
            return res.status(400).json({ error: 'You are already subscribed to gold' });
        }
    }

    if (name == 'premium') {
        price = 49;
    }

    if (name == 'gold') {
        price = 29;
    }


    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // only card payments for now
            line_items: [ 
                {
                    price_data: {
                        currency: 'usd', // USD for now
                        product_data: {
                            name: name,
                        },
                        unit_amount: price * 100, // in cents  
                    },
                    quantity: 1,
                },

            ],

            customer_email: currUser.email,
            
            mode: 'payment',
            success_url: 'http://localhost:5000/sucess', // base url
            cancel_url: 'http://localhost:5000/cancel',
        });

        // as front end -- > got to session.url -- thats all what u need


        res.json({  session });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};


exports.paymentSucess = async (req, res) => {

}