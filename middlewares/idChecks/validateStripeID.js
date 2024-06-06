const paymentMode = require('../../models/Payment');
const AppError = require('../../utils/appError');

module.exports = async (req, res, next) => {
    const { id } = req.query;

    // check if the od in the dbs
    const found = await paymentMode.findOne({ session_id: id });
    if (found) {
        next();
    } else {
        // id not found in db -- fake id
        next(new AppError('Not found', 404));
    }
};
