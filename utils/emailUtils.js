const nodemailer = require("nodemailer");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: Update The names to be more secure
    user: process.env.HOTMAIL_EMAIL,
    pass: process.env.HOTMAIL_PASSWORD,
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
        console.log("Error sending OTP email:", error);
      } else {
        console.log("OTP Email sent successfully:", info.response);
      }
    });

  } catch (error) {
    console.log("Error sending OTP email:", error);
  }
};

module.exports = { sendOTPEmail };
