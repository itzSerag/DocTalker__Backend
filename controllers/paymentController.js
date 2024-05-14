const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { response } = require('express');
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
            success_url: 'http://localhost:5000/success', // base url
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

    // make web hook -- strip web hook exactly

    const endpointSecret = process.env.ENDPOINT_SECRET;
    const sig = request.headers['stripe-signature'];


    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
    
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const checkoutSessionCompleted = event.data.object;
          // Then define and call a function to handle the event checkout.session.completed
          break;
        case 'payment_intent.succeeded':
          const paymentIntentSucceeded = event.data.object;
          // Then define and call a function to handle the event payment_intent.succeeded
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    
      // Return a 200 response to acknowledge receipt of the event
      response.status(200).json({ status: "success" });
    
}