const user = require('../models/User');
const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await user.findById(decoded._id); // already attached to the request object -- mongoose model

        if (req.user === null) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
