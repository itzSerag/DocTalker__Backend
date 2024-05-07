
exports.test = (req, res) => {
    
    res.status(200).json({
        message: 'Test route',
    });
}

exports.testWithAuth = (req, res) => {
    res.status(200).json({
        message: 'Test route with auth',
    });
}