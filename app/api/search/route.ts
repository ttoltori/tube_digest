import { NextRequest, NextResponse } from 'next/server'
import { searchYouTube } from '@/lib/youtube'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  }

  try {
    const [koResults, enResults, jaResults, zhResults] = await Promise.allSettled([
      searchYouTube(query, 'ko', 6),
      searchYouTube(query, 'en', 6),
      searchYouTube(query, 'ja', 4),
      searchYouTube(query, 'zh', 4),
    ])

    return NextResponse.json({
      ko: koResults.status === 'fulfilled' ? koResults.value : [],
      en: enResults.status === 'fulfilled' ? enResults.value : [],
      ja: jaResults.status === 'fulfilled' ? jaResults.value : [],
      zh: zhResults.status === 'fulfilled' ? zhResults.value : [],
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
