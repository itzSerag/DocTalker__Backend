const { pdf } = require('pdf-to-img');
const axios = require('axios'); // For making HTTP requests

// Function to generate images from a PDF hosted on S3 and return an array of pages' bodies
exports.generateImagesFromS3Pdf = async (s3PdfUrl) => {
    try {
        // Fetch the PDF file from S3
        const response = await axios.get(s3PdfUrl, {
            responseType: 'arraybuffer', // Ensure the response is treated as a binary buffer
        });

        console.log('respose', response.data);

        let pagesBodies = [];
        for await (const page of await pdf(response.data)) {
            pagesBodies.push(page);
        }

        return pagesBodies;
    } catch (error) {
        console.error('Error generating images from PDF:', error);
        throw error;
    }
};
