//TODO: Store the subscription details in the database
const subscriptions = {
  free: {
    maxUploadRequest: 2,
    queryMax: 5,
    supportedFiles: ['pdf'],
  },
  gold: {
    maxUploadRequest: 5,
    queryMax: 10,
    supportedFiles: ['pdf', 'docx'],
  },
  premium: {
    maxUploadRequest: 10,
    queryMax: 20,
    supportedFiles: ['all'],
  },
};
exports.checkSubscription = (subscription = '') => {
  return (req, res, next) => {
    if (
      req.user.subscription === subscription ||
      req.user.subscription === 'premium'
    ) {
      return next();
    }
    return res
      .status(403)
      .json({ message: 'Upgrade your plan to access this feature' });
  };
};

exports.checkUploadRequest = (req, res, next) => {
  console.log(req.user);
  if (
    req.user.uploadRequest <
    subscriptions[req.user.subscription].maxUploadRequest
  ) {
    next();
    return;
  }
  return res
    .status(403)
    .json({ message: 'You have reached your upload limit' });
};

exports.checkQueryRequest = (req, res, next) => {
  if (req.user.queryRequest < subscriptions[req.user.subscription].queryMax) {
    return next();
  }
  return res.status(403).json({ message: 'You have reached your query limit' });
};

exports.checkFileType = (req, res, next) => {
  const { file } = req;
  const { supportedFiles } = subscriptions[req.user.subscription];
  const fileExt = file.originalname.split('.').pop();
  if (supportedFiles.includes(fileExt)) {
    return next();
  }
  return res
    .status(403)
    .json({ message: 'File type not supported in your plan, Upgrade' });
};
