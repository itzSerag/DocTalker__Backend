const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = Object.values(err.keyValue)[0];
    return new AppError(`This email already registered please use another `, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

module.exports = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;

    console.error('LOGGING ERROR FROM ERROR CONTROLLER', err);

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    res.status(error.statusCode).json({
        status: error.status + ' from errorController',
        statusCode: error.statusCode,
        message: error.message,
        error: error, // the whole error object
    });
};
