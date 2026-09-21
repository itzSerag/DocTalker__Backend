import { Request, Response, NextFunction } from 'express';
import Payment from '../../models/Payment';
import AppError from '../../utils/appError';

export const validateStripeID = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const sessionId = req.query?.id as string;

    if (!sessionId) {
        return next(new AppError('Stripe session ID query parameter is missing', 400));
    }

    const paymentRecord = await Payment.findOne({ session_id: sessionId });
    if (paymentRecord) {
        return next();
    } else {
        return next(new AppError('Invalid payment session ID', 404));
    }
};

export default validateStripeID;
