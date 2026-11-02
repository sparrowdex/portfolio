import { NextResponse } from 'next/server';


/** Spotify only accepts loopback IPs (not "localhost"), and the dev server reports its host as localhost. */
function callbackUri(request: Request) {
  const host = (request.headers.get('host') ?? 'localhost:3000').replace(/^localhost(?=:|$)/, '127.0.0.1');
  return `http://${host}/api/spotify/callback`;
}
/**
 * DEV-ONLY helper, step 1 of getting SPOTIFY_REFRESH_TOKEN.
 * Visit http://127.0.0.1:3000/api/spotify/login while running `npm run dev`.
 * Disabled (404) in production.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse('Not found', { status: 404 });
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId || !process.env.SPOTIFY_CLIENT_SECRET) {
    return new NextResponse('Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env first, then restart `npm run dev`.', { status: 400 });
  }
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'user-read-currently-playing user-read-recently-played',
    redirect_uri: callbackUri(request),
    state,
  });
  const res = NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
  res.cookies.set('spotify_oauth_state', state, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 600 });
  return res;
}
