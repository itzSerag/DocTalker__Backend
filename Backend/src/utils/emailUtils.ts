import { BrevoClient } from '@getbrevo/brevo';
import logger from './logger';
import AppError from './appError';
import {
    getOTPEmailTemplate,
    getWelcomeEmailTemplate,
    getMarketingEmailTemplate,
    getQuotaAlertEmailTemplate,
    MarketingEmailParams,
    QuotaAlertEmailParams,
} from './emailTemplates';

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

export const sendEmail = async (options: SendEmailOptions): Promise<{ messageId?: string }> => {
    const client = getBrevoClient();
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'doctalker@englishom.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'DocTalker';

    try {
        logger.info(
            { to: options.to, subject: options.subject, senderEmail },
            'Sending transactional email via Brevo API'
        );
        const res = await client.transactionalEmails.sendTransacEmail({
            sender: {
                email: senderEmail,
                name: senderName,
            },
            to: [{ email: options.to }],
            subject: options.subject,
            htmlContent: options.html,
            textContent: options.text || options.html.replace(/<[^>]*>?/gm, ''),
        });
        logger.info(
            { to: options.to, subject: options.subject, messageId: res.messageId },
            'Email sent successfully via Brevo API'
        );
        return { messageId: res.messageId };
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

/**
 * Send dedicated high-converting OTP verification email
 */
export const sendOTPEmail = async (
    toEmail: string,
    otp: string,
    firstName?: string,
    expiryMinutes: number = 20
): Promise<void> => {
    const { subject, html, text } = getOTPEmailTemplate({ otp, firstName, expiryMinutes });
    await sendEmail({
        to: toEmail,
        subject,
        html,
        text,
    });
};

/**
 * Send welcome onboarding email after account verification
 */
export const sendWelcomeEmail = async (toEmail: string, firstName: string): Promise<void> => {
    const appUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app`;
    const { subject, html, text } = getWelcomeEmailTemplate({ firstName, appUrl });
    await sendEmail({
        to: toEmail,
        subject,
        html,
        text,
    });
};

/**
 * Send email marketing / promotional campaign email
 */
export const sendMarketingEmail = async (toEmail: string, params: MarketingEmailParams): Promise<void> => {
    const { subject, html, text } = getMarketingEmailTemplate(params);
    await sendEmail({
        to: toEmail,
        subject,
        html,
        text,
    });
};

/**
 * Send quota warning/limit reached email
 */
export const sendQuotaAlertEmail = async (toEmail: string, params: QuotaAlertEmailParams): Promise<void> => {
    const { subject, html, text } = getQuotaAlertEmailTemplate(params);
    await sendEmail({
        to: toEmail,
        subject,
        html,
        text,
    });
};

export default {
    sendEmail,
    sendOTPEmail,
    sendWelcomeEmail,
    sendMarketingEmail,
    sendQuotaAlertEmail,
};
