const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("../config/AWS_SES_Config");

const createSendEmailCommand = (toAddress, fromAddress, clientName, otp) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<html><body><p>Dear ${clientName},</p><p>Your OTP is: <strong>${otp}</strong></p><p>Thank you for using our service.</p></body></html>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Dear ${clientName},\n\nYour OTP is: ${otp}\n\nThank you for using our service.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `DocTalker Verification - OTP for ${clientName}`,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: ["seragmahmoud62@gmail.com"],  // Adjust as needed
  });
};

const sendOTPEmail = async (toEmail, clientName, otp) => {
  const fromEmail = "seragmahmoud62@gmail.com";  // Ensure this email is verified in SES
  const sendEmailCommand = createSendEmailCommand(toEmail, fromEmail, clientName, otp);

  try {
    const data = await sesClient.send(sendEmailCommand);
    console.log('OTP Email sent successfully:', data.MessageId);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "MessageRejected") {
      console.error('Message rejected:', error);
    } else {
      console.error('Error sending OTP email:', error);
    }
    throw error;
  }
};

module.exports = { sendOTPEmail };
