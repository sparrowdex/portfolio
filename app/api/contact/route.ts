import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

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

    // Send the email using Resend
    const data = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Resend's default testing address. Upgrade to a custom domain for production.
      to: ['sreejadas0405@gmail.com'],
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="background-color: #050505; color: #f5f5f5; font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 30px; border: 1px solid #222; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #4ade80; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 3px; margin: 0; text-transform: uppercase;">PORTFOLIO MESSAGE</p>
            <div style="height: 1px; background-color: #4ade80; margin-top: 15px; opacity: 0.3;"></div>
          </div>
          
          <div style="background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0; font-family: 'Courier New', monospace; font-size: 13px; color: #888;">
              <span style="color: #4ade80;">›</span> <span style="color: #ccc;">NAME:</span> ${name}
            </p>
            <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 13px; color: #888;">
              <span style="color: #4ade80;">›</span> <span style="color: #ccc;">EMAIL:</span> <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
            </p>
          </div>

          <p style="color: #4ade80; font-family: 'Courier New', monospace; font-size: 11px; margin-bottom: 10px; letter-spacing: 1px;">MESSAGE DETAILS:</p>
          <div style="background-color: #111; border-left: 2px solid #4ade80; padding: 15px 20px; color: #e5e5e5; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          
          <div style="margin-top: 40px; text-align: center; font-family: 'Courier New', monospace; font-size: 10px; color: #555;">
            Received on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br/>
            Sreeja's Portfolio
          </div>
        </div>
      `,
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
