import nodemailer from 'nodemailer';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SMTP_CONFIG = {
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
  port: parseInt((process.env.EMAIL_PORT || process.env.SMTP_PORT) as string),
  secure: parseInt(process.env.EMAIL_PORT as string) === 465 || process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
};

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.FROM_EMAIL;
const FROM_NAME = process.env.FROM_NAME || 'Eternal Gift';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eternallove.vercel.app';
const LOGO_URL = `${SITE_URL}/logo.png`;

// =============================================================================
// TRANSPORTER
// =============================================================================

function createTransporter() {
  return nodemailer.createTransport(SMTP_CONFIG);
}

// =============================================================================
// BASE EMAIL TEMPLATE
// Professional, clean design with logo
// =============================================================================

interface EmailTemplateOptions {
  preheader?: string;
}

function getEmailTemplate(content: string, options: EmailTemplateOptions = {}): string {
  const year = new Date().getFullYear();
  const preheader = options.preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${options.preheader}</span>` : '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Eternal Gift</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  ${preheader}
  
  <!-- Main Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:600px;margin:0 auto;">
    
    <!-- Spacer -->
    <tr>
      <td style="padding:30px 20px 0;"></td>
    </tr>
    
    <!-- Content Card with Logo Inside -->
    <tr>
      <td style="padding:0 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#F7F7F8;border-radius:16px;">
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <a href="${SITE_URL}" target="_blank" style="display:inline-block;">
                <img src="https://eternallove.vercel.app/logo-b.png" alt="Eternal Gift" width="120" style="max-width:120px;height:auto;border:0;display:block;margin:0 auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 40px;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding:32px 20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#999;">
          This is an automated message. Please do not reply directly to this email.
        </p>
        <p style="margin:0;font-size:13px;color:#999;">
          &copy; ${year} Eternal Gift. All rights reserved.
        </p>
        <p style="margin:16px 0 0;font-size:12px;">
          <a href="${SITE_URL}/support" style="color:#FF3366;text-decoration:none;">Help Center</a>
          &nbsp;&bull;&nbsp;
          <a href="${SITE_URL}/privacy" style="color:#FF3366;text-decoration:none;">Privacy Policy</a>
          &nbsp;&bull;&nbsp;
          <a href="${SITE_URL}/terms" style="color:#FF3366;text-decoration:none;">Terms of Service</a>
        </p>
      </td>
    </tr>
    
  </table>
</body>
</html>
  `.trim();
}

// =============================================================================
// UI COMPONENTS
// =============================================================================

function button(text: string, href: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto;">
      <tr>
        <td style="border-radius:50px;background:#FF3366;">
          <a href="${href}" target="_blank" style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:50px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function infoBox(content: string, variant: 'success' | 'warning' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#ECFDF5', border: '#10B981' },
    warning: { bg: '#FFFBEB', border: '#F59E0B' },
    info: { bg: '#EFF6FF', border: '#3B82F6' },
  };
  const { bg, border } = colors[variant];
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
      <tr>
        <td style="padding:20px;background-color:${bg};border-left:4px solid ${border};border-radius:8px;">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E5E5E5;margin:28px 0;" />`;
}

function smallText(text: string): string {
  return `<p style="margin:16px 0 0;font-size:13px;color:#666;line-height:1.5;">${text}</p>`;
}

// =============================================================================
// EMAIL FUNCTIONS
// =============================================================================

/**
 * Account Verification Email
 * Sent immediately after registration
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${SITE_URL}/verify-email?token=${token}`;
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;text-align:center;">Verify Your Account</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Thank you for creating an account with Eternal Gift. Please verify your email address to activate your account.</p>
    ${button('Verify My Account', verificationUrl)}
    ${divider()}
    ${smallText(`If the button doesn't work, copy and paste this link into your browser:`)}
    <p style="margin:8px 0 0;font-size:13px;word-break:break-all;"><a href="${verificationUrl}" style="color:#FF3366;">${verificationUrl}</a></p>
    ${smallText('This link expires in 24 hours. If you did not create this account, please ignore this email.')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Verify Your Account - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Confirm your email to get started' }),
  });
}

/**
 * Welcome Email
 * Sent after successful email verification
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<void> {
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;text-align:center;">Welcome to Eternal Gift</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Your account has been verified and you're ready to start creating beautiful digital gifts for your loved ones.</p>
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">Choose a plan that works for you and begin your journey of creating memories that last forever.</p>
    ${button('Get Started', `${SITE_URL}/pricing`)}
    ${divider()}
    ${smallText('If you need any help, our support team is always here for you.')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Welcome to Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Your account is ready' }),
  });
}

/**
 * Password Reset Email
 * Sent when user requests password reset
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;text-align:center;">Reset Your Password</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
    ${button('Reset Password', resetUrl)}
    ${divider()}
    ${smallText(`If the button doesn't work, copy and paste this link into your browser:`)}
    <p style="margin:8px 0 0;font-size:13px;word-break:break-all;"><a href="${resetUrl}" style="color:#FF3366;">${resetUrl}</a></p>
    ${infoBox(`<p style="margin:0;font-size:14px;color:#92400E;">This link expires in 1 hour for security reasons. If you didn't request this change, you can safely ignore this email.</p>`, 'warning')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Reset Your Password - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Password reset requested' }),
  });
}

/**
 * Password Changed Confirmation
 * Sent after password is successfully changed
 */
export async function sendPasswordChangedEmail(
  to: string,
  name: string
): Promise<void> {
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;text-align:center;">Password Changed</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Your password has been changed successfully.</p>
    ${infoBox(`<p style="margin:0;font-size:14px;color:#065F46;">For your security, you have been logged out of all other devices.</p>`, 'success')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">If you did not make this change, please secure your account immediately.</p>
    ${button('Secure My Account', `${SITE_URL}/support`)}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Password Changed - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Your password was updated' }),
  });
}

/**
 * Security Alert Email
 * Sent when suspicious activity is detected
 */
export async function sendSecurityAlertEmail(
  to: string,
  name: string,
  details: string
): Promise<void> {
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;">Security Alert</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">We detected unusual activity on your account:</p>
    ${infoBox(`<p style="margin:0;font-size:14px;color:#92400E;">${details}</p>`, 'warning')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">If this was you, you can ignore this message. Otherwise, we recommend changing your password immediately.</p>
    ${button('Review Security Settings', `${SITE_URL}/dashboard/settings`)}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Security Alert - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Unusual activity detected' }),
  });
}

/**
 * Payment Confirmation Email
 * Sent after successful payment
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  amount: number
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount / 100);
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;">Payment Confirmed</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Thank you for your purchase. Your payment has been processed successfully.</p>
    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Plan:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${plan}</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Amount:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${formattedAmount}</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Date:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
      </table>
    `, 'success')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">Your subscription is now active. You can start creating beautiful digital gifts right away.</p>
    ${button('Go to Dashboard', `${SITE_URL}/dashboard`)}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Payment Confirmed - Eternal Gift',
    html: getEmailTemplate(content, { preheader: `Your ${plan} plan is now active` }),
  });
}

/**
 * Subscription Cancelled Email
 * Sent when user cancels their subscription
 */
export async function sendSubscriptionCancelledEmail(
  to: string,
  name: string,
  endDate: Date
): Promise<void> {
  const formattedDate = endDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;">Subscription Cancelled</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">We've processed your cancellation request.</p>
    ${infoBox(`<p style="margin:0;font-size:14px;color:#92400E;"><strong>Access until:</strong> ${formattedDate}</p>`, 'warning')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">You'll continue to have full access to your plan features until the date above. After that, you won't be charged again.</p>
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">Changed your mind? You can reactivate anytime.</p>
    ${button('Reactivate Subscription', `${SITE_URL}/pricing`)}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Subscription Cancelled - Eternal Gift',
    html: getEmailTemplate(content, { preheader: `Access until ${formattedDate}` }),
  });
}

/**
 * Gift Published Email
 * Sent when a gift is published
 */
export async function sendGiftPublishedEmail(
  to: string,
  name: string,
  giftTitle: string,
  giftUrl: string
): Promise<void> {
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;">Your Gift is Live!</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Great news! Your gift <strong>"${giftTitle}"</strong> has been published successfully.</p>
    ${infoBox(`
      <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;"><strong>Share this link:</strong></p>
      <p style="margin:0;font-size:14px;word-break:break-all;"><a href="${giftUrl}" style="color:#FF3366;">${giftUrl}</a></p>
    `, 'success')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">Share this link with your special someone to make their day unforgettable.</p>
    ${button('View Your Gift', giftUrl)}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `Your Gift "${giftTitle}" is Live! - Eternal Gift`,
    html: getEmailTemplate(content, { preheader: 'Your gift is ready to share' }),
  });
}

/**
 * Subscription Expiring Soon Email
 * Sent 7 days before subscription expires
 */
export async function sendSubscriptionExpiringEmail(
  to: string,
  name: string,
  daysRemaining: number,
  endDate: Date
): Promise<void> {
  const formattedDate = endDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;">Your Subscription Expires Soon</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Your Eternal Gift subscription will expire in <strong>${daysRemaining} days</strong> (${formattedDate}).</p>
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">To continue enjoying all your plan features and keep your gifts accessible, please renew your subscription.</p>
    ${button('Renew Subscription', `${SITE_URL}/dashboard/subscription`)}
    ${divider()}
    ${smallText('If your subscription is set to auto-renew, you can ignore this message.')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Your Subscription Expires Soon - Eternal Gift',
    html: getEmailTemplate(content, { preheader: `${daysRemaining} days remaining` }),
  });
}

/**
 * Subscription Expired Email
 * Sent when subscription has expired
 */
export async function sendSubscriptionExpiredEmail(
  to: string,
  name: string
): Promise<void> {
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;">Your Subscription Has Expired</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Your Eternal Gift subscription has expired. Your account access has been limited.</p>
    ${infoBox(`<p style="margin:0;font-size:14px;color:#92400E;">Your published gifts remain accessible to recipients, but you won't be able to create new ones or edit existing gifts until you renew.</p>`, 'warning')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">Renew now to regain full access to all features.</p>
    ${button('Renew Subscription', `${SITE_URL}/pricing`)}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Your Subscription Has Expired - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Renew to regain access' }),
  });
}

/**
 * Refund Processed Email
 * Sent when a refund is issued
 */
export async function sendRefundEmail(
  to: string,
  name: string,
  amount: number,
  reason?: string
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount / 100);
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;">Refund Processed</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">We've processed your refund request.</p>
    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Amount:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${formattedAmount}</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Date:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        ${reason ? `<tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Reason:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${reason}</td></tr>` : ''}
      </table>
    `, 'info')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">The refund will appear in your account within 5-10 business days, depending on your bank.</p>
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">Your subscription access has been revoked effective immediately.</p>
    ${divider()}
    ${smallText('If you have any questions about this refund, please contact our support team.')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Refund Processed - Eternal Gift',
    html: getEmailTemplate(content, { preheader: `Refund of ${formattedAmount} processed` }),
  });
}

/**
 * New Device Login Email
 * Sent when user logs in from a new device/IP
 */
export async function sendNewDeviceLoginEmail(
  to: string,
  name: string,
  deviceInfo: {
    ip: string;
    userAgent?: string;
    location?: string;
    timestamp: Date;
  }
): Promise<void> {
  const formattedDate = deviceInfo.timestamp.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;text-align:center;">New Login Detected</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">We noticed a login to your Eternal Gift account from a new device or location.</p>
    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Date:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${formattedDate}</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>IP Address:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${deviceInfo.ip}</td></tr>
        ${deviceInfo.location ? `<tr><td style="padding:4px 0;font-size:14px;color:#4A4A4A;"><strong>Location:</strong></td><td style="padding:4px 0;font-size:14px;color:#1A1A1A;text-align:right;">${deviceInfo.location}</td></tr>` : ''}
      </table>
    `, 'warning')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">If this was you, you can ignore this email. If you don't recognize this activity, please secure your account immediately.</p>
    ${button('Secure My Account', `${SITE_URL}/settings`)}
    ${divider()}
    ${smallText('If you did not initiate this login, change your password immediately and contact support.')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'New Login to Your Account - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'New login detected on your account' }),
  });
}

/**
 * Account Deletion Request Email
 * Sent when user requests to delete their account (confirmation)
 */
export async function sendAccountDeletionRequestEmail(
  to: string,
  name: string,
  confirmationToken: string
): Promise<void> {
  const confirmUrl = `${SITE_URL}/api/user/delete/confirm?token=${confirmationToken}`;
  
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;text-align:center;">Account Deletion Request</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">We received a request to permanently delete your Eternal Gift account.</p>
    ${infoBox(`<p style="margin:0;font-size:14px;color:#92400E;"><strong>Warning:</strong> This action is irreversible. All your data, gifts, and settings will be permanently deleted.</p>`, 'warning')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">If you want to proceed with deleting your account, click the button below:</p>
    ${button('Confirm Deletion', confirmUrl)}
    ${divider()}
    ${smallText('This link expires in 1 hour. If you did not request this deletion, you can safely ignore this email.')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Confirm Account Deletion - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Confirm your account deletion request' }),
  });
}

/**
 * Account Deleted Email
 * Sent after account is successfully deleted
 */
export async function sendAccountDeletedEmail(
  to: string,
  name: string
): Promise<void> {
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;text-align:center;">Account Deleted</h1>
    <p style="margin:0 0 8px;font-size:16px;color:#4A4A4A;line-height:1.6;">Hello ${name},</p>
    <p style="margin:0;font-size:16px;color:#4A4A4A;line-height:1.6;">Your Eternal Gift account has been permanently deleted as requested.</p>
    ${infoBox(`<p style="margin:0;font-size:14px;color:#4A4A4A;">All your data, including gifts and settings, has been removed from our systems.</p>`, 'info')}
    <p style="margin:16px 0 0;font-size:16px;color:#4A4A4A;line-height:1.6;">We're sorry to see you go. If you ever want to create beautiful digital gifts again, you're always welcome back.</p>
    ${button('Visit Eternal Gift', SITE_URL)}
    ${divider()}
    ${smallText('Thank you for being part of the Eternal Gift community.')}
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Your Account Has Been Deleted - Eternal Gift',
    html: getEmailTemplate(content, { preheader: 'Your account has been permanently deleted' }),
  });
}

