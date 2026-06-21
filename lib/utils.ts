import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '알 수 없음'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}

export function parseISODuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] || '0')
  const m = parseInt(match[2] || '0')
  const s = parseInt(match[3] || '0')
  return h * 3600 + m * 60 + s
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`
  return `${Math.floor(diffDay / 365)}년 전`
}

export function formatViewCount(count: number): string {
  if (count >= 100000000) return `${(count / 100000000).toFixed(1)}억`
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천`
  return count.toString()
}

export function detectLanguage(text: string): 'ko' | 'en' | 'ja' | 'zh' {
  const koreanPattern = /[\uAC00-\uD7AF\u1100-\u11FF]/
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/
  const chinesePattern = /[\u4E00-\u9FFF]/

  if (koreanPattern.test(text)) return 'ko'
  if (japanesePattern.test(text)) return 'ja'
  if (chinesePattern.test(text)) return 'zh'
  return 'en'
}

export function getLanguageLabel(lang: string): { label: string; flag: string } {
  const map: Record<string, { label: string; flag: string }> = {
    ko: { label: '한국어', flag: '🇰🇷' },
    en: { label: 'English', flag: '🇺🇸' },
    ja: { label: '日本語', flag: '🇯🇵' },
    zh: { label: '中文', flag: '🇨🇳' },
  }
  return map[lang] || { label: lang, flag: '🌐' }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
