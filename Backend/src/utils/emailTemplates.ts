/**
 * DocTalker Email Templates Suite
 * Premium, responsive, client-tested email templates for OTP and Email Marketing.
 * Compatible with Gmail, Apple Mail, Outlook, iOS, and Android mail clients.
 */

const BASE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    min-width: 100%;
    background-color: #090d16;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    color: #f1f5f9;
  }
  table {
    border-spacing: 0;
    border-collapse: collapse;
  }
  td {
    padding: 0;
  }
  img {
    border: 0;
  }
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #090d16;
    padding: 40px 0 60px 0;
  }
  .main {
    background-color: #0f172a;
    margin: 0 auto;
    width: 100%;
    max-width: 580px;
    border-radius: 16px;
    border: 1px solid #1e293b;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  .header {
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
    padding: 36px 32px 28px 32px;
    text-align: center;
    border-bottom: 1px solid #1e293b;
  }
  .logo-badge {
    display: inline-block;
    width: 44px;
    height: 44px;
    line-height: 44px;
    text-align: center;
    background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
    border-radius: 12px;
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
    margin-bottom: 14px;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  }
  .brand-title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #ffffff;
  }
  .brand-subtitle {
    margin: 4px 0 0 0;
    font-size: 12px;
    font-weight: 500;
    color: #818cf8;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .content {
    padding: 36px 36px;
  }
  .footer {
    padding: 24px 32px;
    text-align: center;
    font-size: 12px;
    color: #64748b;
    border-top: 1px solid #1e293b;
    background-color: #0b1120;
  }
  .footer a {
    color: #818cf8;
    text-decoration: none;
  }
  .otp-box {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    margin: 28px 0;
  }
  .otp-code {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: 10px;
    color: #6366f1;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    display: block;
    margin-left: 10px;
  }
  .btn-primary {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #ffffff !important;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .badge-warning {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fbbf24;
  }
  .badge-pro {
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
  }
  .feature-item {
    padding: 12px 16px;
    background: #131d31;
    border-radius: 10px;
    border: 1px solid #1e293b;
    margin-bottom: 10px;
  }
`;

/**
 * 1. OTP Verification Email Template
 */
export interface OTPEmailParams {
    otp: string;
    firstName?: string;
    expiryMinutes?: number;
}

export const getOTPEmailTemplate = ({
    otp,
    firstName,
    expiryMinutes = 20,
}: OTPEmailParams): { subject: string; html: string; text: string } => {
    const subject = `${otp} is your DocTalker verification code`;
    const greeting = firstName ? `Hello ${firstName},` : 'Hello,';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" class="main" border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Header -->
            <tr>
              <td class="header">
                <div class="logo-badge">DT</div>
                <h1 class="brand-title">DocTalker</h1>
                <p class="brand-subtitle">Document Intelligence</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="content">
                <p style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-top: 0;">${greeting}</p>
                <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px 0;">
                  Thank you for using DocTalker. To complete your verification and access your AI workspace, please enter the one-time code below:
                </p>

                <!-- OTP Display -->
                <div class="otp-box">
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; display: block; margin-bottom: 8px;">Your One-Time Code</span>
                  <span class="otp-code">${otp}</span>
                </div>

                <!-- Expiry & Security Notice -->
                <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #283548; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size: 13px; line-height: 1.5; color: #94a3b8;">
                        ⏱️ This verification code will expire in <strong style="color: #f1f5f9;">${expiryMinutes} minutes</strong>.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 6px; font-size: 12px; line-height: 1.4; color: #64748b;">
                        🔒 If you didn't request this code, you can safely ignore this email. Someone may have typed your address by mistake.
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
                  Need help? Reach out to our support team at <a href="mailto:support@doctalker.com" style="color: #818cf8; text-decoration: none;">support@doctalker.com</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p style="margin: 0 0 8px 0; color: #64748b;">&copy; ${new Date().getFullYear()} DocTalker AI Inc. All rights reserved.</p>
                <p style="margin: 0; color: #475569; font-size: 11px;">
                  This is a transactional email sent securely by DocTalker.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    const text = `${greeting}\n\nYour DocTalker verification code is: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nIf you did not request this email, please ignore it.`;

    return { subject, html, text };
};

/**
 * 2. Welcome / Onboarding Email Template
 */
export interface WelcomeEmailParams {
    firstName: string;
    appUrl?: string;
}

export const getWelcomeEmailTemplate = ({
    firstName,
    appUrl = 'https://doctalker.com/app',
}: WelcomeEmailParams): { subject: string; html: string; text: string } => {
    const subject = `Welcome to DocTalker, ${firstName}! Supercharge your documents 🚀`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" class="main" border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Header -->
            <tr>
              <td class="header">
                <div class="logo-badge">DT</div>
                <h1 class="brand-title">DocTalker</h1>
                <p class="brand-subtitle">Welcome Aboard</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="content">
                <span class="badge badge-pro">Account Activated</span>
                <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 16px 0 8px 0;">
                  Your document superpowers are ready.
                </h2>
                <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px 0;">
                  Hi ${firstName}, welcome to DocTalker! You can now analyze lengthy research reports, financial audits, YouTube lectures, and handwritten meeting notes with multimodal AI.
                </p>

                <!-- Feature 1 -->
                <div class="feature-item">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size: 20px; width: 34px; vertical-align: top;">📄</td>
                      <td>
                        <strong style="font-size: 13px; color: #f1f5f9; display: block;">Instant PDF Ingestion & Chat</strong>
                        <span style="font-size: 12px; color: #94a3b8;">Upload multi-page PDFs and ask pinpoint questions with clickable page citations.</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Feature 2 -->
                <div class="feature-item">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size: 20px; width: 34px; vertical-align: top;">🎥</td>
                      <td>
                        <strong style="font-size: 13px; color: #f1f5f9; display: block;">YouTube & Web Extraction</strong>
                        <span style="font-size: 12px; color: #94a3b8;">Paste any YouTube video or article URL to automatically extract transcripts into searchable vectors.</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Feature 3 -->
                <div class="feature-item">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size: 20px; width: 34px; vertical-align: top;">✍️</td>
                      <td>
                        <strong style="font-size: 13px; color: #f1f5f9; display: block;">Handwritten OCR</strong>
                        <span style="font-size: 12px; color: #94a3b8;">Digitize whiteboard drawings, contracts, and scribbled notebook notes in seconds.</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin: 32px 0 16px 0;">
                  <a href="${appUrl}" class="btn-primary">Launch Your Workspace &rarr;</a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p style="margin: 0 0 6px 0; color: #64748b;">&copy; ${new Date().getFullYear()} DocTalker AI Inc.</p>
                <p style="margin: 0; color: #475569; font-size: 11px;">You received this because you created an account on DocTalker.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    const text = `Welcome to DocTalker, ${firstName}!\n\nYour account has been activated. You can now chat with PDFs, extract YouTube transcripts, and scan handwritten notes.\n\nLaunch your workspace: ${appUrl}`;

    return { subject, html, text };
};

/**
 * 3. Email Marketing / Upgrade Offer Template
 */
export interface MarketingEmailParams {
    recipientName?: string;
    badge?: string;
    headline: string;
    subheadline?: string;
    bodyParagraphs: string[];
    features?: Array<{ title: string; desc: string }>;
    ctaText: string;
    ctaUrl: string;
    discountCode?: string;
    discountExpiry?: string;
    unsubscribeUrl?: string;
}

export const getMarketingEmailTemplate = (
    params: MarketingEmailParams
): { subject: string; html: string; text: string } => {
    const {
        recipientName,
        badge = 'Limited Time Offer',
        headline,
        subheadline,
        bodyParagraphs,
        features = [],
        ctaText,
        ctaUrl,
        discountCode,
        discountExpiry,
        unsubscribeUrl = 'https://doctalker.com/unsubscribe',
    } = params;

    const subject = headline;
    const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" class="main" border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Header -->
            <tr>
              <td class="header">
                <div class="logo-badge">DT</div>
                <h1 class="brand-title">DocTalker</h1>
                <p class="brand-subtitle">Intelligence Update</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="content">
                <span class="badge badge-warning">${badge}</span>

                <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 16px 0 8px 0; line-height: 1.3;">
                  ${headline}
                </h2>

                ${subheadline ? `<p style="font-size: 15px; color: #a5b4fc; font-weight: 500; margin: 0 0 20px 0;">${subheadline}</p>` : ''}

                <p style="font-size: 14px; font-weight: 600; color: #f8fafc; margin-top: 0;">${greeting}</p>

                ${bodyParagraphs
                    .map(
                        (p) =>
                            `<p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px 0;">${p}</p>`
                    )
                    .join('')}

                <!-- Feature Highlights -->
                ${
                    features.length > 0
                        ? `
                <div style="margin: 24px 0 20px 0;">
                  ${features
                      .map(
                          (f) => `
                    <div class="feature-item">
                      <strong style="font-size: 13px; color: #f1f5f9; display: block; margin-bottom: 2px;">⚡ ${f.title}</strong>
                      <span style="font-size: 12px; color: #94a3b8; line-height: 1.4;">${f.desc}</span>
                    </div>`
                      )
                      .join('')}
                </div>`
                        : ''
                }

                <!-- Discount Banner -->
                ${
                    discountCode
                        ? `
                <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px dashed #6366f1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 12px; color: #a5b4fc; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Exclusive Coupon Code</span>
                  <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 3px; margin: 6px 0; font-family: monospace;">${discountCode}</div>
                  ${discountExpiry ? `<span style="font-size: 11px; color: #fbbf24;">Valid until ${discountExpiry}</span>` : ''}
                </div>`
                        : ''
                }

                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0 20px 0;">
                  <a href="${ctaUrl}" class="btn-primary">${ctaText} &rarr;</a>
                </div>

                <p style="text-align: center; font-size: 11px; color: #64748b; margin: 0;">
                  Instant activation &bull; 14-day money-back guarantee &bull; Cancel anytime
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p style="margin: 0 0 8px 0; color: #64748b;">&copy; ${new Date().getFullYear()} DocTalker AI Inc.</p>
                <p style="margin: 0 0 8px 0; color: #475569; font-size: 11px;">
                  You received this newsletter or product update as a registered user of DocTalker.
                </p>
                <p style="margin: 0; font-size: 11px;">
                  <a href="${unsubscribeUrl}">Unsubscribe</a> &bull; <a href="https://doctalker.com/privacy">Privacy Policy</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    const text = `${headline}\n\n${greeting}\n\n${bodyParagraphs.join('\n\n')}\n\n${ctaText}: ${ctaUrl}\n\nUnsubscribe: ${unsubscribeUrl}`;

    return { subject, html, text };
};

/**
 * 4. Quota Alert Email Template
 */
export interface QuotaAlertEmailParams {
    firstName: string;
    quotaType: 'queries' | 'uploads';
    used: number;
    max: number;
    upgradeUrl?: string;
}

export const getQuotaAlertEmailTemplate = ({
    firstName,
    quotaType,
    used,
    max,
    upgradeUrl = 'https://doctalker.com/pricing',
}: QuotaAlertEmailParams): { subject: string; html: string; text: string } => {
    const isExceeded = used >= max;
    const pct = Math.min(Math.round((used / max) * 100), 100);
    const subject = isExceeded
        ? `⚠️ Daily ${quotaType} limit reached on DocTalker`
        : `Notice: You have used ${pct}% of your daily ${quotaType}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" class="main" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="header">
                <div class="logo-badge">DT</div>
                <h1 class="brand-title">DocTalker</h1>
                <p class="brand-subtitle">Account Usage</p>
              </td>
            </tr>

            <tr>
              <td class="content">
                <span class="badge ${isExceeded ? 'badge-warning' : 'badge-pro'}">Quota Notice</span>
                <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 16px 0 8px 0;">
                  ${isExceeded ? `Daily ${quotaType} limit reached` : `You're close to your daily ${quotaType} limit`}
                </h2>
                <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
                  Hi ${firstName}, you have used <strong>${used} of ${max}</strong> daily ${quotaType} (${pct}%).
                </p>

                <!-- Meter Bar -->
                <div style="background: #1e293b; border-radius: 9999px; height: 10px; overflow: hidden; margin-bottom: 24px; border: 1px solid #334155;">
                  <div style="background: ${isExceeded ? '#ef4444' : '#6366f1'}; width: ${pct}%; height: 100%;"></div>
                </div>

                <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0 0 24px 0;">
                  Your quota automatically resets at midnight. Upgrade to <strong>Gold</strong> or <strong>Premium</strong> for unlimited queries, high-speed models, and priority OCR processing.
                </p>

                <div style="text-align: center; margin: 28px 0 16px 0;">
                  <a href="${upgradeUrl}" class="btn-primary">Upgrade Plan &rarr;</a>
                </div>
              </td>
            </tr>

            <tr>
              <td class="footer">
                <p style="margin: 0; color: #64748b;">&copy; ${new Date().getFullYear()} DocTalker AI Inc.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

    const text = `Hi ${firstName},\n\nYou have used ${used} of ${max} daily ${quotaType} (${pct}%).\n\nUpgrade for unlimited access: ${upgradeUrl}`;

    return { subject, html, text };
};
