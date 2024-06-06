const nodemailer = require('nodemailer');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.HOTMAIL_EMAIL,
        pass: process.env.HOTMAIL_PASSWORD,
    },
    tls: {
        ciphers: 'SSLv3',
    },
});

// Function to send OTP email
const sendOTPEmail = async (toEmail, otp) => {
    try {
        // Create email options
        const mailOptions = {
            from: process.env.HOTMAIL_EMAIL,
            to: toEmail,
            subject: 'DocTalker Verification',
            // TODO: Update email text to make it more user-friendly
            text: `Your OTP is: ${otp}`,
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending OTP email:', error);
            } else {
                console.log('OTP Email sent successfully:', info.response);
            }
        });
    } catch (error) {
        console.log('Error sending OTP email:', error);
    }
};

module.exports = { sendOTPEmail };
