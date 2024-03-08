const User = require('../models/user');

exports.updateUser = async (req, res) => {
    try {
        const { _id: id } = req.user;
        const { firstName, lastName } = req.body;

        await User.findByIdAndUpdate(id, { firstName, lastName });
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Unexpected error during user update.' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { _id: id } = req.user;

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unexpected error during user deletion.' });
    }
};
