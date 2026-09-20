import express, { Request, Response, NextFunction, Application } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import morgan from 'morgan';
import cors from 'cors';

import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import './config/passport';

// Routes
import paymentRoutes from './routes/paymentRoute';
import uploadRoutes from './routes/uploadRoute';
import queryRoutes from './routes/queryRoute';
import userRoutes from './routes/userRoute';
import chatRoutes from './routes/chatRoute';
import extractionRoutes from './routes/extractionsRoute';
import feedbackRoutes from './routes/feedbackRoute';
import handwrittenRoutes from './routes/handwrittenRoute';
import testRoutes from './routes/testRoute';

export const createApp = (): Application => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    })
  );

  // Development Logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Rate Limiting
  const limiter = rateLimit({
    max: Number(process.env.RATE_LIMIT_MAX) || 300,
    windowMs: 60 * 60 * 1000,
    message: {
      status: 'fail',
      message: 'Too many requests from this IP. Please try again after an hour.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Body parsers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'doctalker-session-secret-key-12345',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Mount API Routes
  app.use('/api/user', userRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/query', queryRoutes);
  app.use('/api/extractions', extractionRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/handwritten', handwrittenRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/test', testRoutes);

  // 404 Route Not Found Handler
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
  });

  // Global Centralized Error Handler
  app.use(globalErrorHandler);

  return app;
};

export default createApp;
