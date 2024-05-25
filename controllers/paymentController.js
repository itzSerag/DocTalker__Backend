const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PaymentModel = require('../models/Payment');
const User = require('../models/User');

exports.createCheckoutSession = async (req, res) => {
    const name  = req.productName;
    const currUser = req.user
    const price = req.price;


    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // only card payments for now
            client_reference_id: currUser._id,
            line_items: [ 
                {
                    price_data: {
                        currency: 'usd', // USD for now
                        product_data: {
                            name: name + " Subscription",
                          
                        },
                        unit_amount: price * 100, // in cents  
                       
                    },
                    quantity: 1,
                },


            ],

            customer_email: currUser.email,
    
            
            mode: 'payment',
            success_url: `http://localhost:5000/success`,
            cancel_url: 'http://localhost:5000/cancel',
        });

        // as front end -- > got to session.url -- thats all what u need

        // handle the db and what to save in payment model
        // save the session.id in the payment model
        // save the user id in the payment model
        // save the product name in the payment model
        // save the price in the payment model
        // save the date in the payment model

        const payment = new PaymentModel({
            user: currUser._id,
            amount: price,
            product: name,
            session_id: session.id,
        });

        await payment.save();
        
        /// to make changes after the payment is done
        // we can use stripe webhooks


        res.json({  session });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};



// !! MUST DO IT AFTER THE PAYMENT IS DONE -- AFTER DocTalker IS PUBLICLY AVAILABLE

exports.paymentSucess = async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.id);
    const payment = await PaymentModel
        .findOne({ session_id: session.id })
        .populate('user');
    
    // update the user subscription

    const user = await User.findById(payment.user._id);
    user.subscription = payment.product;

    await user.save();

    res.json({ 
        status: 'success',
        message: 'Payment successful && subscription updated',
     });

}