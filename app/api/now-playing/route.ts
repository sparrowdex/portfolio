import { NextResponse } from 'next/server';
import { getNowPlaying } from '../../utils/spotify';

/** What Sreeja is listening to on Spotify (or last played). Polled by the corner disc. */
export async function GET() {
  try {
    const data = await getNowPlaying();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
    });
  } catch (err) {
    console.error('now-playing:', err);
    // Treat failures as "not available" so the widget quietly hides.
    return NextResponse.json({ configured: false, isPlaying: false }, { status: 200 });
  }
}
