import nodemailer from 'nodemailer';

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT as string),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME = process.env.FROM_NAME;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Cria transporter do nodemailer
 */

function createTransporter() {
  return nodemailer.createTransport(SMTP_CONFIG);
}

/**
 * Template base de email
 */

function getEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Eternal Gift</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #FF3366 0%, #FDA4AF 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
          color: #333;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: #FF3366;
          color: white !important;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: #f9f9f9;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .divider {
          height: 1px;
          background: #eee;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💝 Eternal Gift</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
          <p>© ${new Date().getFullYear()} Eternal Gift. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envia email de verificação de conta
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${SITE_URL}/verify-email?token=${token}`;
  
  const content = `
    <h2>Hello, ${name}! 👋</h2>
    <p>Thank you for signing up for Eternal Gift!</p>
    <p>To activate your account and start creating unforgettable digital gifts, click the button below:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify My Account</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verificationUrl}" style="color: #FF3366;">${verificationUrl}</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      This link expires in 24 hours.
    </p>
    <p style="font-size: 14px; color: #666;">
      If you didn't create this account, please ignore this email.
    </p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Verify your account - Eternal Gift',
    html: getEmailTemplate(content),
  });
}

/**
 * Envia email de reset de senha
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
  
  const content = `
    <h2>Hello, ${name}! 👋</h2>
    <p>We received a request to reset your account password.</p>
    <p>If you made this request, click the button below to create a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #FF3366;">${resetUrl}</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      This link expires in 1 hour for security reasons.
    </p>
    <p style="font-size: 14px; color: #d32f2f;">
      <strong>⚠️ Important:</strong> If you didn't request this change, ignore this email and your password will remain unchanged. We recommend you change your password immediately if you suspect unauthorized access.
    </p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Password Reset - Eternal Gift',
    html: getEmailTemplate(content),
  });
}

/**
 * Envia email de boas-vindas após verificação
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<void> {
  const content = `
    <h2>Welcome to Eternal Gift, ${name}! 🎉</h2>
    <p>Your account has been successfully verified!</p>
    <p>Now you can start creating unforgettable digital gifts for your loved ones.</p>
    <h3>What you can do:</h3>
    <ul style="line-height: 2;">
      <li>📸 Unlimited photo uploads</li>
      <li>🎵 Add custom soundtrack</li>
      <li>💌 Write eternal love letters</li>
      <li>🎨 Customize themes and fonts</li>
      <li>📱 Generate custom QR Code</li>
      <li>🔗 Share via unique link</li>
    </ul>
    <div style="text-align: center;">
      <a href="${SITE_URL}/dashboard" class="button">Create My First Gift</a>
    </div>
    <div class="divider"></div>
    <p>If you need help, our team is always available!</p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Welcome to Eternal Gift! 🎁',
    html: getEmailTemplate(content),
  });
}

/**
 * Envia email de confirmação de senha alterada
 */
export async function sendPasswordChangedEmail(
  to: string,
  name: string
): Promise<void> {
  const content = `
    <h2>Hello, ${name}! 👋</h2>
    <p>Your password has been changed successfully.</p>
    <p>If you didn't make this change, please contact us immediately.</p>
    <div style="text-align: center;">
      <a href="${SITE_URL}/support" class="button">Report Problem</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #666;">
      For security, you have been logged out of all active sessions.
    </p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Password Changed - Eternal Gift',
    html: getEmailTemplate(content),
  });
}

/**
 * Envia email de alerta de tentativas de login suspeitas
 */
export async function sendSecurityAlertEmail(
  to: string,
  name: string,
  details: string
): Promise<void> {
  const content = `
    <h2>⚠️ Security Alert</h2>
    <p>Hello, ${name}!</p>
    <p>We detected suspicious activity on your account:</p>
    <p style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; margin: 20px 0;">
      ${details}
    </p>
    <p>If this was you, ignore this email. Otherwise, we recommend you:</p>
    <ul>
      <li>Change your password immediately</li>
      <li>Review your security settings</li>
      <li>Contact us if you need help</li>
    </ul>
    <div style="text-align: center;">
      <a href="${SITE_URL}/settings/security" class="button">Review Security</a>
    </div>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: '⚠️ Security Alert - Eternal Gift',
    html: getEmailTemplate(content),
  });
}














