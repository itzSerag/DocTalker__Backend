const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

exports.auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await user.findById(decoded._id); // already attached to the request object -- mongoose model

        if (req.user === null) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        return next(new AppError(`Error ${error}`, 404));
    }
};
