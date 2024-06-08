const { SESClient } = require("@aws-sdk/client-ses");

const REGION = process.env.AWS_BUCKET_REGION;  // Ensure this environment variable is set
const sesClient = new SESClient({ region: REGION });

module.exports = { sesClient };
