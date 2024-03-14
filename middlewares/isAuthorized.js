const AppError = require('../utils/appError');

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
            return next(new AppError('Invalid subscription type', 400));
        }
        if (subscription === 'premium' || subscription === 'admin') {
            return next();
        }
        return next(new AppError('You are not authorized to access this resource', 403));
    };
};

exports.checkUploadRequest = (req, res, next) => {
    const { subscription } = req.user;
    const maxUploadRequest = subscriptions[subscription].maxUploadRequest;
    if (req.user.uploadRequest < maxUploadRequest) {
        next();
    } else {
        return next(new AppError('You have reached your upload limit of Uploading', 403));
    }
};

exports.checkQueryRequest = (req, res, next) => {
    const { subscription } = req.user;
    const queryMax = subscriptions[subscription].queryMax;
    if (req.user.queryRequest < queryMax) {
        next();
    } else {
        return next(new AppError('You have reached your query limit of Uploading', 403));
    }
};

exports.checkFileType = (req, res, next) => {
    let files = [];

    // Check if its a single file or multiple files upload
    if (req.file) {
        files.push(req.file);
    } else if (req.files && Array.isArray(req.files)) {
        files = req.files;
    } else {
        return next(new AppError('No files found in the request', 400));
    }

    // Check if there are any files to process
    if (files.length === 0) {
        return next(new AppError('No files found in the request', 400));
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
            return next(new AppError(`File type ${fileExtension} not supported`, 400));
        }
    }
    next();
};
