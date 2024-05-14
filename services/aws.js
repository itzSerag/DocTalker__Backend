const { S3Client, DeleteObjectCommand, ListObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

/// NOTE THE ALLOWED OPERATIONS FOR THE S3 CLIENT IS DELETE AND UPLOAD ONLY
/// FILE KEY IS THE NAME OF THE FILE -- key is the name of the file in the bucket --

// create createFolder function
// HELPER FUNCTION
// AWS config
const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

exports.createS3Folder = async (folderName) => {
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: folderName,
            Body: '',
        },
    });

    let data = await upload.done();
    return data.Location;
};

exports.uploadFile = async (fileKey = '', fileBody = '', fileType = '', folderName = '') => {
    // by that ,, making the folder optional with defualt value of empty string
    // already handled with userID in uploadController

    if (folderName !== '' && !folderName.endsWith('/')) {
        folderName = folderName + '/';
    }

    const upload = new Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: folderName + fileKey,
            Body: fileBody,
            ContentType: fileType,
        },
    });

    let data = await upload.done();

    return{
        Location : data.Location ,
        Key : data.Key
    } 
};

exports.deleteFile = async (fileKey) => {
    const deleteObject = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
    });

    let data = await s3.send(deleteObject);
    return data.DeleteMarker;
};

// -- > to retrive a folder
exports.listAllObjects = async (Bucket, Prefix) => {
    const command = new ListObjectsCommand({ Bucket, Prefix });
    return s3.send(command);
};

exports.uploadFolder = async (files, userID, folderName) => {
    folderName = userID + '/' + folderName + '/';
    let dataLocation = [];
    let dataKeys = []

    // upload the files to the folder

    // !! MUST MAKE CHANGES FOR FOLDER OF FILES
    for (const file of files) {
        const location = await module.exports.uploadFile(file.originalname, file.buffer, file.mimetype, folderName)
        dataLocation.push(location.Location);
        dataKeys.push(location.Key);
    }

    return [
        [dataLocation] , [dataKeys]
    ]
};
