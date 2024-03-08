const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

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

// set the view engine to ejs
app.set('view engine', 'ejs');

// set the public folder
app.use(express.static('public'));

const PORT = process.env.PORT || 5000;

// CORS middleware
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: false,
    })
);

// Middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
    })
);

// Passport initialization --> for google auth
app.use(passport.initialize());
app.use(passport.session());

// Home auth
app.get('/', (req, res) => {
    try {
        res.render('index');
    } catch (err) {
        res.status(500).json({ status: 'error' });
    }
});

// Routes
const paymentRoutes = require('../routes/payment');
const uploadRoute = require('../routes/upload');
const queryRoute = require('../routes/query');
const userRoutes = require('../routes/userRoute');
const chatRoutes = require('../routes/chatRoute');
const extractionRoutes = require('../routes/extractions');

// Mount routes
app.use('/payment', paymentRoutes);
app.use('/upload', uploadRoute);
app.use('/query', queryRoute);
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/extractions', extractionRoutes);

// Error handling middleware -- 404 not found -- all for other routes and request methods
app.all('*', (req, res, next) => {
    next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

// remmber 4 -- > fail and 5 --> error

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
