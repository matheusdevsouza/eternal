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
    <html lang="pt-BR">
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
          <p>Este é um email automático, por favor não responda.</p>
          <p>© ${new Date().getFullYear()} Eternal Gift. Todos os direitos reservados.</p>
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
  const verificationUrl = `${SITE_URL}/verificar-email?token=${token}`;
  
  const content = `
    <h2>Olá, ${name}! 👋</h2>
    <p>Obrigado por se cadastrar no Eternal Gift!</p>
    <p>Para ativar sua conta e começar a criar presentes digitais inesquecíveis, clique no botão abaixo:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verificar Minha Conta</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #666;">
      Se o botão não funcionar, copie e cole este link no seu navegador:<br>
      <a href="${verificationUrl}" style="color: #FF3366;">${verificationUrl}</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      Este link expira em 24 horas.
    </p>
    <p style="font-size: 14px; color: #666;">
      Se você não criou esta conta, por favor ignore este email.
    </p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Verifique sua conta - Eternal Gift',
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
  const resetUrl = `${SITE_URL}/redefinir-senha?token=${token}`;
  
  const content = `
    <h2>Olá, ${name}! 👋</h2>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
    <p>Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Redefinir Senha</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #666;">
      Se o botão não funcionar, copie e cole este link no seu navegador:<br>
      <a href="${resetUrl}" style="color: #FF3366;">${resetUrl}</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      Este link expira em 1 hora por questões de segurança.
    </p>
    <p style="font-size: 14px; color: #d32f2f;">
      <strong>⚠️ Importante:</strong> Se você não solicitou esta alteração, ignore este email e sua senha permanecerá inalterada. Recomendamos que você altere sua senha imediatamente caso suspeite de acesso não autorizado.
    </p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Redefinição de senha - Eternal Gift',
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
    <h2>Bem-vindo ao Eternal Gift, ${name}! 🎉</h2>
    <p>Sua conta foi verificada com sucesso!</p>
    <p>Agora você pode começar a criar presentes digitais inesquecíveis para as pessoas que você ama.</p>
    <h3>O que você pode fazer:</h3>
    <ul style="line-height: 2;">
      <li>📸 Upload ilimitado de fotos</li>
      <li>🎵 Adicionar trilha sonora personalizada</li>
      <li>💌 Escrever cartas de amor eternas</li>
      <li>🎨 Personalizar temas e fontes</li>
      <li>📱 Gerar QR Code customizado</li>
      <li>🔗 Compartilhar via link único</li>
    </ul>
    <div style="text-align: center;">
      <a href="${SITE_URL}/dashboard" class="button">Criar Meu Primeiro Presente</a>
    </div>
    <div class="divider"></div>
    <p>Se precisar de ajuda, nossa equipe está sempre disponível!</p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Bem-vindo ao Eternal Gift! 🎁',
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
    <h2>Olá, ${name}! 👋</h2>
    <p>Sua senha foi alterada com sucesso.</p>
    <p>Se você não fez esta alteração, entre em contato conosco imediatamente.</p>
    <div style="text-align: center;">
      <a href="${SITE_URL}/suporte" class="button">Reportar Problema</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #666;">
      Por segurança, você foi desconectado de todas as suas sessões ativas.
    </p>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Senha Alterada - Eternal Gift',
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
    <h2>⚠️ Alerta de Segurança</h2>
    <p>Olá, ${name}!</p>
    <p>Detectamos atividade suspeita em sua conta:</p>
    <p style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; margin: 20px 0;">
      ${details}
    </p>
    <p>Se foi você, ignore este email. Caso contrário, recomendamos que você:</p>
    <ul>
      <li>Altere sua senha imediatamente</li>
      <li>Revise suas configurações de segurança</li>
      <li>Entre em contato conosco se precisar de ajuda</li>
    </ul>
    <div style="text-align: center;">
      <a href="${SITE_URL}/configuracoes/seguranca" class="button">Revisar Segurança</a>
    </div>
  `;

  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: '⚠️ Alerta de Segurança - Eternal Gift',
    html: getEmailTemplate(content),
  });
}





