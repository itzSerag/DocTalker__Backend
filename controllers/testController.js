
exports.test = async (req, res) => {

   

    res.status(200).json({
        message: tokenMessage,
        tokens : tokens ,
        tokenLength : tokens.length
    });
}







// ###############################


exports.testWithAuth = (req, res) => {


    res.status(200).json({
        message: 'Test route with auth',

    });
}