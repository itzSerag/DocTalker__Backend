// *  HANDLING ALL OPERTIONAL ERRORS -- NO try catch * //

module.exports = (err, req, res, next) => {
    console.error(err.stack);

    // error handling for the operational error -- 500 for unknown error
    err.statusCode = err.statusCode || 500;
    // error status
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        statusCode: err.statusCode,
        message: err.message, // the message that comes form the err
    });
};
 