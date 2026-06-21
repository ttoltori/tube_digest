import { Video, Subscription } from './types'
import { parseISODuration, detectLanguage } from './utils'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

function getApiKey(): string {
  return process.env.YOUTUBE_API_KEY || ''
}

export async function getSubscriptions(accessToken: string): Promise<Subscription[]> {
  const url = `${YOUTUBE_API_BASE}/subscriptions?part=snippet&mine=true&maxResults=50&order=relevance`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error('Failed to fetch subscriptions:', await res.text())
    return []
  }

  const data = await res.json()
  const items = data.items || []

  return items.map((item: any) => ({
    channelId: item.snippet.resourceId.channelId,
    channelTitle: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.default?.url || '',
    description: item.snippet.description || '',
  }))
}

export async function getChannelRecentVideos(channelId: string, maxResults = 5): Promise<Video[]> {
  const apiKey = getApiKey()

  // Get uploads playlist ID
  const channelRes = await fetch(
    `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
    { next: { revalidate: 3600 } }
  )
  const channelData = await channelRes.json()
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsPlaylistId) return []

  // Get videos from uploads playlist
  const playlistRes = await fetch(
    `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  )
  const playlistData = await playlistRes.json()
  const playlistItems = playlistData.items || []

  const videoIds = playlistItems
    .map((item: any) => item.snippet?.resourceId?.videoId)
    .filter(Boolean)

  if (videoIds.length === 0) return []

  return getVideoDetails(videoIds)
}

export async function getVideoDetails(videoIds: string[]): Promise<Video[]> {
  const apiKey = getApiKey()
  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: videoIds.join(','),
    key: apiKey,
  })

  const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`, {
    next: { revalidate: 3600 },
  })
  const data = await res.json()

  return (data.items || []).map((item: any): Video => {
    const snippet = item.snippet || {}
    const stats = item.statistics || {}
    const duration = parseISODuration(item.contentDetails?.duration || 'PT0S')

    return {
      id: item.id,
      title: snippet.title || '',
      description: snippet.description || '',
      channelId: snippet.channelId || '',
      channelTitle: snippet.channelTitle || '',
      thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
      publishedAt: snippet.publishedAt || '',
      durationSeconds: duration,
      viewCount: parseInt(stats.viewCount || '0'),
      language: detectLanguage(snippet.title || ''),
      tags: snippet.tags?.slice(0, 5) || [],
      url: `https://www.youtube.com/watch?v=${item.id}`,
    }
  })
}

export async function searchYouTube(
  query: string,
  language: string,
  maxResults = 8
): Promise<Video[]> {
  const apiKey = getApiKey()

  const langParam: Record<string, string> = {
    ko: 'ko',
    en: 'en',
    ja: 'ja',
    zh: 'zh-Hans',
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    maxResults: String(maxResults),
    type: 'video',
    relevanceLanguage: langParam[language] || language,
    key: apiKey,
  })

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`)
  const data = await res.json()
  const items = data.items || []

  if (items.length === 0) return []

  const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean)
  return getVideoDetails(videoIds)
}
