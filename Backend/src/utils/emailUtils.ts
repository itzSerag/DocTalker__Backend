import { BrevoClient } from '@getbrevo/brevo';
import logger from './logger';
import AppError from './appError';

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

let brevoClient: BrevoClient | null = null;

const getBrevoClient = (): BrevoClient => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        logger.error('Brevo API key is not configured in environment variables');
        throw new AppError('Email service configuration error: BREVO_API_KEY is missing', 500);
    }

    if (!brevoClient) {
        brevoClient = new BrevoClient({ apiKey });
    }
    return brevoClient;
};

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
    const client = getBrevoClient();
    const senderEmail =
        process.env.BREVO_SENDER_EMAIL ||
        process.env.SMTP_USER ||
        process.env.HOTMAIL_EMAIL ||
        'no-reply@doctalker.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'DocTalker';

    try {
        logger.info({ to: options.to, subject: options.subject }, 'Sending transactional email via Brevo API');
        await client.transactionalEmails.sendTransacEmail({
            sender: {
                email: senderEmail,
                name: senderName,
            },
            to: [{ email: options.to }],
            subject: options.subject,
            htmlContent: options.html,
            textContent: options.text || options.html.replace(/<[^>]*>?/gm, ''),
        });
        logger.info({ to: options.to, subject: options.subject }, 'Email sent successfully via Brevo API');
    } catch (error: any) {
        logger.error(
            {
                err: error,
                to: options.to,
                senderEmail,
                details: error?.response?.data || error?.body || error?.message,
            },
            `Failed to send email via Brevo API: ${error.message}`
        );
        throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
};

export const sendOTPEmail = async (toEmail: string, otp: string): Promise<void> => {
    const subject = 'DocTalker Verification Code';
    const text = `Your DocTalker verification code is: ${otp}. It will expire in 20 minutes.`;
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #111827; margin-bottom: 8px;">DocTalker Verification</h2>
      <p style="color: #4b5563; font-size: 15px;">Your verification code is:</p>
      <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin: 16px 0;">
        <span style="color: #4F46E5; font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code is valid for <strong>20 minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
  `;

    await sendEmail({
        to: toEmail,
        subject,
        html,
        text,
    });
};

export default { sendEmail, sendOTPEmail };
