const AppError = require('../../utils/appError');

module.exports = async (req, res, next) => {
    const { chatId } = req.body;
    const {chats} = req.user;

    // check if the chatId in user chats array 
    const found = chats.includes(chatId);

    if (found) {
        next();
    } else {
        next(new AppError('ID Not found', 404));
    }
}