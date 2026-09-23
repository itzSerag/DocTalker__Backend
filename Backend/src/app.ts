import express, { Request, Response, NextFunction, Application } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import pinoHttp from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import logger from './utils/logger';
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

export const App = (): Application => {
    const app = express();

    // HTTP Request Logging with Pino (clean & concise)
    app.use(
        pinoHttp({
            logger,
            autoLogging: {
                ignore: (req) => req.url === '/health' || req.url === '/favicon.ico',
            },
            customLogLevel: (_req, res, err) => {
                if (res.statusCode >= 500 || err) return 'error';
                if (res.statusCode >= 400) return 'warn';
                return 'info';
            },
            customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
            customErrorMessage: (req, _res, err) => `${req.method} ${req.url} - ${err.message}`,
            serializers: {
                req: (req) => ({
                    method: req.method,
                    url: req.url,
                }),
                res: (res) => ({
                    statusCode: res.statusCode,
                }),
                err: (err) => ({
                    message: err.message,
                }),
            },
        })
    );

    // Security Headers
    app.use(helmet());

    // CORS (dynamically echo origin when credentials: true is active)
    const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : ['*'];

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
                    return callback(null, origin);
                }
                return callback(null, origin);
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            credentials: true,
        })
    );

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

    // Body & Cookie parsers
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser(process.env.SESSION_SECRET));

    // Session
    app.use(
        session({
            secret: process.env.SESSION_SECRET!,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
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

    // 404 Route Not Found Handler - for anything passes
    app.all('*', (req: Request, _res: Response, next: NextFunction) => {
        next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
    });

    // Global Centralized Error Handler
    app.use(globalErrorHandler);

    return app;
};
