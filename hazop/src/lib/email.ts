import { Resend } from 'resend';
import { env } from './env';

const resend = new Resend(env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `HAZOP Labs <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

function getEmailTemplate(content: { title: string; body: string; buttonText: string; buttonUrl: string; footer?: string; subfooter?: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
      <div style="max-width: 500px; margin: 0 auto;">
        <!-- Header with Logo -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-flex; align-items: flex-end; gap: 8px;">
            <span style="font-size: 24px; font-weight: 700; color: #18181b;">HAZOP</span>
            <span style="font-size: 20px; font-weight: 600; color: #ea580c;">Labs</span>
          </div>
        </div>
        
        <!-- Main Card -->
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border: 1px solid #f1f5f9;">
          <h1 style="color: #18181b; margin: 0 0 16px; font-size: 24px; font-weight: 600;">${content.title}</h1>
          <p style="color: #64748b; margin: 0 0 32px; line-height: 1.7; font-size: 15px;">${content.body}</p>
          
          <!-- Button -->
          <a href="${content.buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4);">${content.buttonText}</a>
          
          ${content.footer ? `<p style="color: #94a3b8; margin: 32px 0 0; font-size: 13px;">${content.footer}</p>` : ''}
          ${content.subfooter ? `<p style="color: #cbd5e1; margin: 12px 0 0; font-size: 12px;">${content.subfooter}</p>` : ''}
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} HAZOP Labs. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  
  const html = getEmailTemplate({
    title: 'Reset Your Password',
    body: 'You requested to reset your password. Click the button below to create a new password. This link is valid for 1 hour.',
    buttonText: 'Reset Password',
    buttonUrl: resetUrl,
    footer: 'This link will expire in 1 hour.',
    subfooter: "If you didn't request this, you can safely ignore this email.",
  });

  return sendEmail({ to: email, subject: 'Reset your password - HAZOP Labs', html });
}

export async function sendInvitationEmail(
  email: string,
  token: string,
  organizationName: string,
  inviterName: string
) {
  const inviteUrl = `${appUrl}/invite?token=${token}`;

  const html = getEmailTemplate({
    title: "You're Invited!",
    body: `${inviterName} has invited you to join ${organizationName} on HAZOP Labs.`,
    buttonText: 'Accept Invitation',
    buttonUrl: inviteUrl,
    footer: 'This invitation will expire in 7 days.',
  });

  return sendEmail({ to: email, subject: `You're invited to join ${organizationName} - HAZOP Labs`, html });
}
