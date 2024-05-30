// jech the id of chat id from db if its not found then its a fake id

const ChatModel = require('../../models/Chat');
const AppError = require('../../utils/appError');

module.exports = async (req, res, next) => {
    const { chatId } = req.query;

    const found = await ChatModel.findById(chatId);
    if (found) {
        next();
    } else {
        next(new AppError('ID Not found', 404));
    }
}