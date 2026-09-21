import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

const SUBSCRIPTION_PRICES: Record<string, number> = {
    Gold: 29,
    Premium: 49,
};

export const paymentsCheck = (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
        return next(new AppError('User must be logged in', 401));
    }

    // Support both { product: { name: 'Gold' } } or { product: 'Gold' } or { name: 'Gold' }
    const productName =
        req.body?.product?.name || (typeof req.body?.product === 'string' ? req.body.product : null) || req.body?.name;

    if (!productName) {
        return next(new AppError('Subscription product name not provided', 400));
    }

    const price = SUBSCRIPTION_PRICES[productName];
    if (!price) {
        return next(
            new AppError(
                `Invalid product "${productName}". Available plans: ${Object.keys(SUBSCRIPTION_PRICES).join(', ')}`,
                400
            )
        );
    }

    const userSub = req.user.subscription;
    if (userSub === productName) {
        return next(new AppError(`You are already subscribed to ${productName}`, 400));
    }

    const currentPrice = SUBSCRIPTION_PRICES[userSub] || 0;
    if (price < currentPrice) {
        return next(new AppError('Downgrades must be performed via account settings', 400));
    }

    req.price = price;
    req.productName = productName;
    return next();
};

export default paymentsCheck;
