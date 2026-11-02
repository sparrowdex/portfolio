/**
 * Server-only Spotify helper for the "now playing" disc.
 *
 * Needs three env vars (see README section "Spotify now playing"):
 *   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
 * Without them everything reports { configured: false } and the disc stays hidden.
 */

export interface NowPlaying {
  configured: boolean;
  /** true = playing right now; false = last played track (or nothing) */
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  url?: string;
  progressMs?: number;
  durationMs?: number;
  /** ISO time, for "last played" */
  playedAt?: string;
}

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
/** Give up on slow network calls instead of hanging the request. */
const TIMEOUT_MS = 5000;
const API = 'https://api.spotify.com/v1';

export const spotifyConfigured = () =>
  Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_REFRESH_TOKEN);

const basicAuth = () =>
  Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

// Access tokens last an hour; keep one in memory instead of refreshing every request.
let token: { value: string; expires: number } | null = null;

async function accessToken() {
  if (token && Date.now() < token.expires - 60_000) return token.value;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`spotify token ${res.status}`);
  const json = await res.json();
  token = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return token.value;
}

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number }[] };
  external_urls: { spotify: string };
  duration_ms: number;
};

const fromTrack = (t: SpotifyTrack) => ({
  title: t.name,
  artist: t.artists.map((a) => a.name).join(', '),
  album: t.album.name,
  // pick a small-ish cover (~300px) if available
  albumArt: [...t.album.images].sort((a, b) => Math.abs(a.width - 300) - Math.abs(b.width - 300))[0]?.url,
  url: t.external_urls.spotify,
  durationMs: t.duration_ms,
});

// Tiny response cache so a busy page doesn't hammer Spotify.
let cached: { at: number; data: NowPlaying } | null = null;
const CACHE_MS = 15_000;

export async function getNowPlaying(): Promise<NowPlaying> {
  if (!spotifyConfigured()) return { configured: false, isPlaying: false };
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.data;
  try {
    return await fetchNowPlaying();
  } catch (err) {
    // Network blip (timeouts etc.): keep showing the last known track rather than hiding the disc.
    if (cached) {
      console.warn('now-playing: Spotify unreachable, serving last known track', (err as Error).message);
      return cached.data;
    }
    throw err;
  }
}

async function fetchNowPlaying(): Promise<NowPlaying> {
  const auth = { Authorization: `Bearer ${await accessToken()}` };
  let data: NowPlaying = { configured: true, isPlaying: false };

  const now = await fetch(`${API}/me/player/currently-playing`, { headers: auth, cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (now.status === 200) {
    const json = await now.json();
    // Only songs (not podcast episodes / ads)
    if (json?.item && json.currently_playing_type === 'track') {
      data = { configured: true, isPlaying: Boolean(json.is_playing), progressMs: json.progress_ms, ...fromTrack(json.item) };
    }
  }

  if (!data.title) {
    const recent = await fetch(`${API}/me/player/recently-played?limit=1`, { headers: auth, cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (recent.ok) {
      const item = (await recent.json())?.items?.[0];
      if (item?.track) data = { configured: true, isPlaying: false, playedAt: item.played_at, ...fromTrack(item.track) };
    }
  }

  cached = { at: Date.now(), data };
  return data;
}
