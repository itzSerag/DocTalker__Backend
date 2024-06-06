const docToImg = require('pdf-img-convert');
const axios = require('axios');

// Function to generate images from a Word document hosted on S3 and return an array of pages' bodies
exports.generateImagesFromS3Doc = async (s3DocUrl) => {
    try {
        // Fetch the Word document file from S3
        const response = await axios.get(s3DocUrl, {
            responseType: 'arraybuffer', // Ensure the response is treated as a binary buffer
        });

        let pagesBodies = [];
        // Assuming docToImg has a similar interface to pdf-to-img
        for await (const page of await docToImg.convert(response.data)) {
            pagesBodies.push(page);
        }

        return pagesBodies;
    } catch (error) {
        console.error('Error generating images from Word document:', error);
        throw error;
    }
};
