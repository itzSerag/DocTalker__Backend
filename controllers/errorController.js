// *  HANDLING ALL OPERTIONAL ERRORS -- NO try catch * //

const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.email;
    return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

// NOTE -- the error handling middleware has 4 parameters -- this is how express knows that this is an error handling middleware
module.exports = (err, req, res, next) => {
    let error = { ...err }; // copy the error object -- shallow copy -- not pointing to the same object

    console.log(' LOGGING ERROR FROM ERROR CONTROLLER', err);
    // error handling for the operational error -- 11000 for duplicate error -- > Mongoose error
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    if (err.code === 11000) {
        error = handleDuplicateFieldsDB(error);
    }

    err.statusCode = err.statusCode || 500;
    // error status
    err.status = err.status || 'error';

    res.status(error.statusCode).json({
        status: error.status + ' from errorController',
        statusCode: error.statusCode,
        message: error.message, // the message that comes form the err
        error: err, // the whole error object
    });
};
