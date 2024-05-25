const express = require('express');
require('dotenv').config();
const session = require('express-session');
const helmet = require('helmet');
const expressRateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const golbalErrorHandler = require('../controllers/errorController');
const AppError = require('../utils/appError');
const app = express();
const { connectDB } = require('../config/database');

// DEV ENVIRONMENT
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // development logging
}

const PORT = process.env.PORT || 5000;

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// CORS middleware
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: false,
    })
);

// Rate limiting middleware
const limiter = expressRateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again after an hour',
});

// Middleware for JSON and URL-encoded data
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // set to true in production
        },
    })
);

// Passport initialization --> for google auth
app.use(passport.initialize());
app.use(passport.session());

// Middleware for rate limiting
app.use('/api', limiter);

// Routes
const paymentRoutes = require('../routes/paymentRoute');
const uploadRoute = require('../routes/uploadRoute');
const queryRoute = require('../routes/queryRoute');
const userRoutes = require('../routes/userRoute');
const chatRoutes = require('../routes/chatRoute');
const extractionRoutes = require('../routes/extractionsRoute');
const feedbackRoutes = require('../routes/feedbackRoute');
const handwrittenRoutes = require('../routes/handwrittenRoute');
const testRoutes = require('../routes/testRoute');

// Mount routes
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/query', queryRoute);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/extractions', extractionRoutes);
app.use('/api/feedback', feedbackRoutes);

// Test routes
app.use('/api/test', testRoutes);

// app.use('/api/starMesaage', chatRoutes);

// SUPER PREMIUM ROUTES
app.use('/api/handwritten', handwrittenRoutes);



//TEST PAYMENT succesful

app.get('/successful' , (req,res)=>{

    res.send('Payment successful')
})


// Error handling middleware -- 404 not found -- all for other routes and request methods
app.all('*', (req, res, next) => {
    next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

// remmber 4.x.x -- > fail and 5.x.x --> error

// Global error handling middleware
app.use(golbalErrorHandler);

// start the DB connection before starting the app
connectDB()
    .then(() => {
        console.log('Database connected');
        // Start the server after the database connection is established
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(process.env.NODE_ENV);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
