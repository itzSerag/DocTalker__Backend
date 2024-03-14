const subscriptions = {
    free: {
        maxUploadRequest: 2,
        queryMax: 5,
        supportedFiles: ['pdf'],
    },
    gold: {
        maxUploadRequest: 5,
        queryMax: 100,
        supportedFiles: ['pdf', 'docx', 'txt'],
    },
    premium: {
        maxUploadRequest: 50,
        queryMax: 1000,
        supportedFiles: ['all'],
    },

    admin: {
        maxUploadRequest: 1000,
        queryMax: 10000,
        supportedFiles: ['all'],
    },
};

exports.checkSubscription = () => {
    return (req, res, next) => {
        const { subscription } = req.user;
        if (!subscription || !subscriptions[subscription]) {
            return res.status(403).json({ message: 'Invalid subscription. Please upgrade your plan.' });
        }
        if (subscription === 'premium' || subscription === 'admin') {
            return next();
        }
        return res.status(403).json({ message: 'Upgrade your plan to access this feature' });
    };
};

exports.checkUploadRequest = (req, res, next) => {
    const { subscription } = req.user;
    const maxUploadRequest = subscriptions[subscription].maxUploadRequest;
    if (req.user.uploadRequest < maxUploadRequest) {
        next();
    } else {
        return res.status(403).json({ message: 'You have reached your upload limit' });
    }
};

exports.checkQueryRequest = (req, res, next) => {
    const { subscription } = req.user;
    const queryMax = subscriptions[subscription].queryMax;
    if (req.user.queryRequest < queryMax) {
        next();
    } else {
        return res.status(403).json({ message: 'You have reached your query limit' });
    }
};

exports.checkFileType = (req, res, next) => {
    let files = [];

    // Check if its a single file or multiple files upload
    if (req.file) {
        files.push(req.file);
    } else if (req.files && Array.isArray(req.files)) {
        files = req.files;
    }

    // Check if there are any files to process
    if (files.length === 0) {
        return res.status(400).json({ message: 'No files found in the request' });
    }

    const { subscription } = req.user;
    const supportedFiles = subscriptions[subscription].supportedFiles;

    // Loop through each file and check its type
    for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        const fileExtension = currentFile.originalname.split('.').pop().toLowerCase();
        if (supportedFiles.includes('all') || supportedFiles.includes(fileExtension)) {
            continue;
        } else {
            return res.status(403).json({ message: 'File type not supported in your plan. Please upgrade your plan.' });
        }
    }
    next();
};
