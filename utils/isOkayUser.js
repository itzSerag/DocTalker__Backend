exports.isOkayToUpload = async (req, res) => {
    const currUser = req.user;
    const isOkayToUpload = currUser.maxUploadRequest - currUser.uploadRequest > 0;

    if (!isOkayToUpload) {
        return res.status(400).json({ message: 'You have exceeded your upload limit' });
    } else {
        return true;
    }
};

exports.isUserFree = async (req, res) => {
    try {
        // Ensure req.user is populated
        const currUser = req.user;
        if (!currUser) {
            // Handle case where req.user is not populated
            console.log('User not authenticated or req.user is null');
            return false;
        }

        // Check if the subscription is 'free'
        if (currUser.subscription === 'free') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        // Handle any errors gracefully
        console.error('Error in isUserFree function:', error);
        return false;
    }
};
