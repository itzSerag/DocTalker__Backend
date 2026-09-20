import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment';
import User from '../models/User';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

const getStripe = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
  return new Stripe(secretKey);
};

export const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stripe = getStripe();
    const currUser = req.user;
    const name = req.productName || req.body?.name || 'Subscription';
    const price = req.price || req.body?.price || 29;

    if (!currUser) {
      return next(new AppError('User not authenticated', 401));
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      client_reference_id: currUser._id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${name} Subscription`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: currUser.email,
      metadata: {
        subscription_name: name,
        userId: currUser._id.toString(),
      },
      mode: 'payment',
      success_url: `${baseUrl}/api/payment/success?id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/payment/cancel?id={CHECKOUT_SESSION_ID}`,
    });

    const payment = new Payment({
      user: currUser._id,
      amount: price,
      product: name,
      session_id: session.id,
    });

    await payment.save();

    return res.status(200).json({
      status: 'success',
      url: session.url,
      sessionId: session.id,
    });
  }
);

export const paymentSuccess = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stripe = getStripe();
    const sessionId = req.query.id as string;

    if (!sessionId) {
      return next(new AppError('Payment session ID is required', 400));
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscription = (session.metadata?.subscription_name || 'Gold') as 'Gold' | 'Premium';

    const payment = await Payment.findOne({ session_id: sessionId });
    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    let queryMax = 50;
    let maxUploadRequest = 5;

    if (subscription === 'Gold') {
      queryMax = 200;
      maxUploadRequest = 30;
      payment.subscription_Expires_Date = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
    } else if (subscription === 'Premium') {
      queryMax = 500;
      maxUploadRequest = 50;
      payment.subscription_Expires_Date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }

    await payment.save();

    await User.findByIdAndUpdate(payment.user, {
      $set: {
        subscription,
        queryMax,
        maxUploadRequest,
        subscription_Expires_Date: payment.subscription_Expires_Date,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment completed successfully. Your subscription has been updated.',
      data: {
        subscription,
        queryMax,
        maxUploadRequest,
      },
    });
  }
);

export const paymentCancel = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'failed',
    message: 'Payment checkout was cancelled.',
  });
};

export default { createCheckoutSession, paymentSuccess, paymentCancel };
