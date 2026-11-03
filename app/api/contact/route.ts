import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildEmail } from './emailTemplate';

// Visitor input goes into the email's HTML, so escape it.
const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawName = String(body?.name ?? '').trim().slice(0, 100);
    const rawEmail = String(body?.email ?? '').trim().slice(0, 200);
    const rawMessage = String(body?.message ?? '').trim().slice(0, 5000);
    if (rawEmail && !EMAIL_RE.test(rawEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const name = escapeHtml(rawName);
    const email = escapeHtml(rawEmail);
    const message = escapeHtml(rawMessage);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables.');
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    // Create the client per request: the key only exists at runtime, not during the build.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const data = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Resend's default testing address. Upgrade to a custom domain for production.
      to: ['sreejadas0405@gmail.com'],
      replyTo: rawEmail,
      subject: `✦ new message from ${rawName.replace(/[\r\n]+/g, ' ')} (portfolio)`,
      html: buildEmail({ name, email, message, firstName: escapeHtml(rawName.split(' ')[0] || rawName) }),
    });

    if (data.error) {
      console.error('Resend API Error:', data.error);
      return NextResponse.json(
        { error: data.error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error) {
    console.error('Error in contact API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
