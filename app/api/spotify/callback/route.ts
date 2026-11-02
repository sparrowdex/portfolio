import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';


/** Spotify only accepts loopback IPs (not "localhost"), and the dev server reports its host as localhost. */
function callbackUri(request: Request) {
  const host = (request.headers.get('host') ?? 'localhost:3000').replace(/^localhost(?=:|$)/, '127.0.0.1');
  return `http://${host}/api/spotify/callback`;
}
/**
 * DEV-ONLY helper, step 2: Spotify redirects here after you approve access.
 * Exchanges the code for a refresh token and shows it so you can paste it into .env.
 * Disabled (404) in production.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse('Not found', { status: 404 });

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const saved = (await cookies()).get('spotify_oauth_state')?.value;
  if (!code || !state || state !== saved) {
    return new NextResponse(`Spotify sign-in didn't complete (${url.searchParams.get('error') ?? 'state mismatch'}). Try /api/spotify/login again.`, {
      status: 400,
    });
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: callbackUri(request) }),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || !json.refresh_token) {
    return new NextResponse(`Token exchange failed: ${json.error_description ?? json.error ?? res.status}`, { status: 400 });
  }

  const html = `<!doctype html><meta charset="utf-8"><title>Spotify connected</title>
<body style="font-family:'Courier New',monospace;background:#ffd6ee;color:#1a0f1f;padding:40px;max-width:720px;margin:auto">
<h1 style="color:#c2006f">✦ Spotify connected!</h1>
<p>Add this line to your <b>.env</b> (and to your hosting provider's environment variables), then restart the server:</p>
<pre style="background:#fff;border:2px solid #7a0044;border-radius:8px;padding:16px;white-space:pre-wrap;word-break:break-all">SPOTIFY_REFRESH_TOKEN=${json.refresh_token}</pre>
<p style="color:#7a0044">Keep it secret: it lets this site read what you're listening to.</p>
</body>`;
  const out = new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  out.cookies.delete('spotify_oauth_state');
  return out;
}
