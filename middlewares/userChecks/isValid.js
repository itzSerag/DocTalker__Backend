const AppError = require('../../utils/appError');

module.exports = async (req, res, next) => {
    const { isVerified } = req.user;

    if (isVerified) {
        next();
    } else {
        next(new AppError('User Not found  Or user must be verify first ', 404));
    }
};
