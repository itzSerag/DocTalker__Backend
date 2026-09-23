import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { clearAuthCookie } from '../utils/cookieUtils';
import { sendMarketingEmail } from '../utils/emailUtils';

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const { firstName, lastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName },
        { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: { user: updatedUser },
    });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    await User.findByIdAndDelete(req.user._id);
    clearAuthCookie(res);

    return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
    });
});

export const me = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const user = await User.findById(req.user._id).select('-password');

    return res.status(200).json({
        status: 'success',
        user,
    });
});

export const sendTestMarketingEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const { toEmail, headline, bodyParagraphs, badge, ctaText, ctaUrl, discountCode } = req.body;
    const targetEmail = toEmail || req.user.email;

    await sendMarketingEmail(targetEmail, {
        recipientName: req.user.firstName,
        badge: badge || 'Special Pro Offer',
        headline: headline || 'Unlock Superhuman Speed with DocTalker Pro 🚀',
        subheadline: 'Exclusive 20% discount on all annual intelligence plans',
        bodyParagraphs: bodyParagraphs || [
            'Experience unlimited document intelligence, multi-modal vector queries, and instant YouTube transcript extraction.',
            'Upgrade today and get priority access to Claude 3.5 Sonnet, GPT-4o, and Gemini 2.5 Pro models with zero daily query limits.',
        ],
        features: [
            {
                title: 'Unlimited Deep Vector Search',
                desc: 'No daily limits on document queries and semantic vector retrieval.',
            },
            {
                title: 'Multimodal OCR & YouTube',
                desc: 'Ingest handwritten scans and video audio transcripts instantly.',
            },
            {
                title: 'Dedicated Priority Infrastructure',
                desc: 'Lightning-fast sub-second responses with streaming citations.',
            },
        ],
        ctaText: ctaText || 'Claim 20% Off Pro',
        ctaUrl: ctaUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
        discountCode: discountCode || 'DOCTALKER20',
        discountExpiry: 'Next 48 Hours',
    });

    return res.status(200).json({
        status: 'success',
        message: `Marketing email sent successfully to ${targetEmail}`,
    });
});

export default { updateUser, deleteUser, me, sendTestMarketingEmail };
