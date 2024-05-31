// middle ware to see if the user is valid -- > verfied the otp

// Path: middlewares/userChecks/isValid.js

const User  = require('../../models/User');
const AppError = require('../../utils/appError');

module.exports = async (req, res, next) => {
    const { email } = req.body;

    const found = await User.findOne({email});
    if (found) {
        next();
    } else {
        next(new AppError('User Not found  Or user must be verify first ', 404));
    }
}