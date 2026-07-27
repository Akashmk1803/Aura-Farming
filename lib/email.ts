import nodemailer from 'nodemailer';

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailArgs) {
  const mode = process.env.EMAIL_VERIFICATION_MODE || 'mock';

  if (mode === 'mock') {
    console.log('\n==================================================');
    console.log('📬 [EMAIL MOCK] Verification email queued:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Plain text: ${text}`);
    console.log('==================================================\n');
    return;
  }

  // Live Mode: Nodemailer Gmail SMTP setup
  const smtpUser = process.env.GMAIL_SMTP_USER;
  const smtpPass = process.env.GMAIL_SMTP_APP_PASSWORD;

  if (!smtpUser || !smtpPass || smtpUser.includes('your-email') || smtpPass.includes('your-gmail-app-password')) {
    throw new Error('Gmail SMTP credentials are not configured correctly in .env for live email mode.');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"Aura Farming" <${smtpUser}>`,
    to,
    subject,
    text,
    html,
  });
}

export function getVerificationEmailTemplate(url: string) {
  return {
    text: `AURA FARMING — Verify your account by clicking the following link: ${url}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Aura Account</title>
        <style>
          body {
            background-color: #0c0c0e;
            color: #ece8e1;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px 20px;
            text-align: center;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #161619;
            border: 1px solid #e10600;
            border-radius: 12px;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
          }
          h1 {
            color: #ece8e1;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 24px;
          }
          p {
            color: rgba(236, 232, 225, 0.6);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #e10600;
            color: #0c0c0e;
            text-decoration: none;
            padding: 14px 28px;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            border-radius: 6px;
            margin-bottom: 30px;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #ff0a00;
          }
          .footer {
            color: rgba(236, 232, 225, 0.25);
            font-size: 10px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 20px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="color: #e10600; font-weight: bold; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 8px;">Aura Farming</div>
          <h1>Verify Your Initiation</h1>
          <p>The mark is waiting. To complete your registration and unlock full access to our drops, please verify your email by clicking below.</p>
          <a class="btn" href="${url}">Verify Account</a>
          <p style="font-size: 11px; color: rgba(236, 232, 225, 0.4); word-break: break-all; margin-top: 10px;">
            Or copy and paste this link in your browser:<br>
            <a href="${url}" style="color: #e10600; text-decoration: none;">${url}</a>
          </p>
          <div class="footer">
            Born Cursed. Worn Proud.
          </div>
        </div>
      </body>
      </html>
    `
  };
}
