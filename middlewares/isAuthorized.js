const AppError = require('../utils/appError');

const subscriptions = {
    free: {
        supportedFiles: ['pdf'],
        queryMax: 50,
        maxUploadRequest: 5,
    },
    Gold: {
        supportedFiles: ['pdf', 'docx', 'txt'],
        queryMax: 200,
        maxUploadRequest: 30,
    },
    Premium: {
        supportedFiles: ['all'],
        queryMax: 500,
        maxUploadRequest: 50,
    },
    admin: {
        supportedFiles: ['all'],
        queryMax: 10000,
        maxUploadRequest: 1000,
    },
};

exports.checkSubscription = () => {
    return (req, res, next) => {
        const { subscription } = req.user;
        if (!subscription || !subscriptions[subscription]) {
            return next(new AppError('Invalid subscription type or not found', 400));
        }

        // if user subscription is ended and not renewed -- > make the user free
        if (req.user.subscription_Expires_Date && req.user.subscription_Expires_Date < new Date()) {
            req.user.subscription = 'free';
        }

        if (subscription === 'premium' || subscription === 'admin') {
            return next(); // they both have unlimited access
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

    // return an array of user supported files -- according to the user plan
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

