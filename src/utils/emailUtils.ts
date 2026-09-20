import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter;

const getTransporter = (): Transporter => {
  if (!transporter) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: process.env.HOTMAIL_EMAIL,
          pass: process.env.HOTMAIL_PASSWORD,
        },
      });
    }
  }
  return transporter;
};

export const sendOTPEmail = async (toEmail: string, otp: string): Promise<void> => {
  const mailTransporter = getTransporter();
  const fromEmail = process.env.HOTMAIL_EMAIL || process.env.SMTP_USER || 'no-reply@doctalker.com';

  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: 'DocTalker Verification Code',
    text: `Your DocTalker verification code is: ${otp}. It will expire in 20 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>DocTalker Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #4F46E5; letter-spacing: 4px;">${otp}</h1>
        <p>This code is valid for 20 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await mailTransporter.sendMail(mailOptions);
};

export default { sendOTPEmail };
