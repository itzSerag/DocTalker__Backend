const { connectDB } = require('../config/database');
const Doc = require('../models/document');
const slugify = require('slugify');
const {uploadFile} = require('../services/aws');
const {deleteFile}  = require('../services/aws');
const chatmodel = require('../models/Chat');


uploadSingleFile = async (req , res) => {
    try
    {
        // 1. connect to the mongodb db
        await connectDB()
            .then(() => {
                console.log('MongoDB Connected -- uploading phase -- ');
            });

       
        
        // check if the file is pdf
        if (file.mimetype !== 'application/pdf') {
            res.json({
                error: 'Only PDF files are allowed.'  
                // TODO : ADD MORE FILE TYPES
            });

        
        } else {

            // Check if the necessary file properties are available
            // 4. upload the file to s3
            const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype)
                
            // 7. save file info to the mongodb db

            const myFile = new Doc({
                FileName: file.originalname,
                FileUrl: dataLocation, // aws file url
            });
            
            await myFile.save()
            .then(() => {
                
                const chat = new chatmodel({
                    documentId: myFile._id,
                    chatName: slugify(file.originalname)
                })
                
                    chat.save().then(() => {
                    
                    // Increse the upload request for the user
                    currUser.uploadRequest += 1;
                    currUser.chats.push(chat._id);
                    
                    currUser.save()
                    return res.status(200).json({
                        message: 'File uploaded to S3 and MongoDB successfully',
                        chatId: chat._id
                    });
                    
                    
                }).catch(err => {res.status(500).json({message: err.message})});
            })
            .catch((err) => {});
            // await disconnectDB()
        
        };
      

    } catch (e) {
        
        // await disconnectDB()
        return res.status(500).send({
            message: e.message,
        });
    }
}


uploadFolder = async (req, res) => {
    try {
        // 1. connect to the mongodb db
        await connectDB()
            .then(() => {
                console.log('MongoDB Connected -- uploading Folder phase -- ');
            });

        // iterate through the files and upload all of them to s3
        const files = req.files;
        const fileUrls = [];

        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if(file.mimetype !== 'application/pdf' || file.mimetype !== 'application/msword' || file.mimetype !== 'application/txt'){ 
                const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype);
                fileUrls.push(dataLocation);
            }
            else {
                return res.json(400)({
                    error: 'Only PDF, Word and Text files are allowed.'
                    // TODO : ADD MORE FILE TYPES
                });
            }
        }

        //  save file info to the mongodb db
        const myFile = new Doc({
            FileName: files.originalname,
            // !! NOTICE : I made the fileURL is an array of the file urls
            FileUrl: fileUrls,
        });

        await myFile.save()
            .then(() => {

                const chat = new chatmodel({
                    documentId: myFile._id,
                    chatName: slugify(files.originalname)
                });

                chat.save().then(() => {

                    // Increse the upload request for the user
                    // ?? I think we should increase the upload request for each file uploaded
                    currUser.uploadRequest += files.length;
                    currUser.save();
                    return res.status(200).json({
                        message: 'Files uploaded to S3 and MongoDB successfully',
                    });
                }).catch(err => { res.status(500).json({ message: err.message }); });
            });



    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}



exports.handler = async (req, res) => {

  const file = req.file
  // 1. only allow POST methods
  if (req.method !== 'POST') {
      return res.status(400).send('method not supported');
  }

  // check if the file pdf and its exist

  const currUser = req.user;
  
  const isOkayToUpload = currUser.maxUploadRequest - currUser.uploadRequest > 0;
  const userAuth = currUser.subscription

  if(!isOkayToUpload)
  {
    return res.status(400).json({message : 'You have exceeded your upload limit'});

  } else{

    if(req.file)
    {
        uploadSingleFile(req, res);
    }
    else if(req.files && userAuth !== 'free')
    {
        // check the maximum files upload request and the qouta of the user
        if(currUser.maxUploadRequest - currUser.uploadRequest < req.files.length)
        {
            return res.status(400).json({message : 'You have exceeded your upload limit'});
        }

        // max files in the folder is 5 -- for now
        if(req.files.length > 5)
        {
            return res.status(400).json({message : 'You can only upload 5 files at a time'});
        }
        
        uploadFolder(req, res);
    }

    else{

        return res.status(400).json({message : 'No file uploaded Error'});
    }
   
    
} // end else
}