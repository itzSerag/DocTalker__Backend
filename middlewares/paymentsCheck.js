
// i want to maje obj to contain all data about subscribtions and its prices
// and check if the user is already subscribed to the same subscribtion
// and return the error message
// and if not subscribed to the same subscribtion
// then return the session url
// and if the subscribtion is not found
// then return the error message
// and if the subscribtion is found
// then return the session url
// and if the subscribtion is not found
// then return the error message
// and if the subscribtion is found
// then return the session url

// and to be a middleware

const AppError = require('../utils/appError');


const subscriptions = {
    Premium: 49,
    Gold: 29
};

module.exports = (req, res, next) => {
    const { name } = req.body.product;

    if (!name) {
        return next(new AppError('name of subscription not found or not provided', 400));
    }

    if (!subscriptions[name]) {
        return next(new AppError('product not found', 400));
    }

    if (req.user.subscription === name) {
        return next(new AppError(`You are already subscribed to ${name}`, 400));
    }

    // check if the user wants to subscribe to a less expensive plan
    if (subscriptions[name] < subscriptions[req.user.subscription]) {
        return next(new AppError( `You are already subscribed to a more expensive plan`, 400));
    }



    req.price = subscriptions[name];
    req.productName = name;
    next();
};