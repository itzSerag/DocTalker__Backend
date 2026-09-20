import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { SubscriptionType } from '../models/User';

interface SubscriptionPlan {
  supportedFiles: string[];
  queryMax: number;
  maxUploadRequest: number;
}

export const SUBSCRIPTIONS: Record<SubscriptionType, SubscriptionPlan> = {
  free: {
    supportedFiles: ['pdf'],
    queryMax: 50,
    maxUploadRequest: 5,
  },
  Gold: {
    supportedFiles: ['pdf', 'docx', 'txt'],
    queryMax: 200,
    maxUploadRequest: 30,
  },
  Premium: {
    supportedFiles: ['all'],
    queryMax: 500,
    maxUploadRequest: 50,
  },
  admin: {
    supportedFiles: ['all'],
    queryMax: 10000,
    maxUploadRequest: 1000,
  },
};

export const checkSubscription = () => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { subscription } = req.user;

    // Check if subscription expired
    if (
      req.user.subscription_Expires_Date &&
      new Date(req.user.subscription_Expires_Date) < new Date()
    ) {
      req.user.subscription = 'free';
      req.user.save().catch((err) => console.error('Failed to downgrade expired user:', err));
    }

    if (!subscription || !SUBSCRIPTIONS[req.user.subscription]) {
      return next(new AppError('Invalid or missing subscription tier', 400));
    }

    const currentSub = req.user.subscription;
    if (currentSub === 'Premium' || currentSub === 'admin') {
      return next();
    }

    return next(new AppError('You need a Premium subscription to access this feature', 403));
  };
};

export const checkUploadRequest = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const subscription = req.user.subscription || 'free';
  const plan = SUBSCRIPTIONS[subscription] || SUBSCRIPTIONS.free;

  if (req.user.uploadRequest < plan.maxUploadRequest) {
    return next();
  }

  return next(
    new AppError(
      `You have reached your daily upload limit (${plan.maxUploadRequest} uploads). Please upgrade or try again tomorrow.`,
      403
    )
  );
};

export const checkQueryRequest = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const subscription = req.user.subscription || 'free';
  const plan = SUBSCRIPTIONS[subscription] || SUBSCRIPTIONS.free;

  if (req.user.queryRequest < plan.queryMax) {
    return next();
  }

  return next(
    new AppError(
      `You have reached your daily query limit (${plan.queryMax} queries). Please upgrade or try again tomorrow.`,
      403
    )
  );
};

export const checkFileType = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  let files: Express.Multer.File[] = [];

  if (req.file) {
    files.push(req.file);
  } else if (req.files) {
    if (Array.isArray(req.files)) {
      files = req.files;
    } else {
      // Multiple fields
      Object.values(req.files).forEach((fieldFiles) => {
        files.push(...fieldFiles);
      });
    }
  }

  if (files.length === 0) {
    return next(new AppError('No files found in upload request', 400));
  }

  const subscription = req.user.subscription || 'free';
  const plan = SUBSCRIPTIONS[subscription] || SUBSCRIPTIONS.free;
  const supported = plan.supportedFiles;

  for (const file of files) {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    if (supported.includes('all') || supported.includes(ext)) {
      continue;
    } else {
      return next(
        new AppError(
          `File type ".${ext}" is not supported on your "${subscription}" plan. Supported formats: ${supported.join(', ')}`,
          400
        )
      );
    }
  }

  return next();
};

export default {
  checkSubscription,
  checkUploadRequest,
  checkQueryRequest,
  checkFileType,
};
