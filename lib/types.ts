export interface Video {
  id: string
  title: string
  description: string
  channelId: string
  channelTitle: string
  thumbnail: string
  publishedAt: string
  durationSeconds: number
  viewCount: number
  language: 'ko' | 'en' | 'ja' | 'zh'
  tags: string[]
  url: string
}

export interface Summary {
  id: string
  videoId: string
  userId: string
  summaryKo: string
  keyPoints: string[]
  readingTime: string
  lengthType: 'short' | 'medium' | 'long'
  createdAt: string
}

export interface VideoWithSummary extends Video {
  summary?: Summary
}

export interface Subscription {
  channelId: string
  channelTitle: string
  thumbnail: string
  description: string
}

export interface UserSettings {
  keywords: string[]
  languages: string[]
  summaryLength: 'short' | 'medium' | 'long'
  notifications: {
    morningDigest: boolean
    keywordAlerts: boolean
    weeklyReport: boolean
  }
  channelWeights: {
    aiTech: number
    economy: number
    education: number
    other: number
  }
}

export interface UserProfile {
  id: string
  avatarUrl: string | null
  youtubeAccessToken: string | null
  youtubeRefreshToken: string | null
  settings: UserSettings
  totalTimeSavedMinutes: number
  totalSummaries: number
  createdAt: string
}

export interface Keyword {
  id: string
  userId: string
  keyword: string
  enabled: boolean
  matchCount: number
  createdAt: string
}

export interface SearchResultGroup {
  language: 'ko' | 'en' | 'ja' | 'zh'
  label: string
  flag: string
  videos: VideoWithSummary[]
}

export interface SummarizeRequest {
  videoId: string
  title: string
  description: string
  channelTitle: string
  language: string
  lengthType?: 'short' | 'medium' | 'long'
}

export interface SummarizeResponse {
  summary: string
  keyPoints: string[]
  readingTime: string
}
