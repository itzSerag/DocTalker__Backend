module.exports = (fn) => {
    // Return a function that takes in req, res, next and calls the async
    // function fn with them -- and catches any errors that might occur in async functions

    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
