const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// TODO : APPLY AppError and catchAsync

exports.updateUser = catchAsync(async (req, res) => {
    const { _id: id } = req.user;
    const { firstName, lastName } = req.body;

    await User.findByIdAndUpdate(id, { firstName, lastName });
    res.status(200).json({ message: 'User updated successfully' });
});

exports.deleteUser = catchAsync(async (req, res) => {
    const { _id: id } = req.user;

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
});

exports.getMe = catchAsync(async (req, res) => {
    const { _id: id } = req.user;
    const user = await User.findById(id);
    delete user._doc.password;
    res.status(200).json({ ...user._doc });
});
