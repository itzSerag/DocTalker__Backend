import { Request, Response } from 'express';

export const test = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'success',
    message: 'DocTalker Backend API is running properly',
    timestamp: new Date().toISOString(),
  });
};

export const testWithAuth = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'success',
    message: 'Authenticated test route reached successfully',
    user: {
      id: req.user?._id,
      email: req.user?.email,
      subscription: req.user?.subscription,
    },
  });
};

export default { test, testWithAuth };
