'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ExternalLink, Sparkles, Clock, Eye, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { VideoWithSummary } from '@/lib/types'
import { formatDuration, formatRelativeTime, formatViewCount, getLanguageLabel } from '@/lib/utils'

interface VideoCardProps {
  video: VideoWithSummary
  lengthType?: 'short' | 'medium' | 'long'
}

export default function VideoCard({ video, lengthType = 'short' }: VideoCardProps) {
  const [summary, setSummary] = useState(video.summary)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const { label: langLabel, flag } = getLanguageLabel(video.language)

  const handleSummarize = async () => {
    if (summary) {
      setExpanded(!expanded)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          title: video.title,
          description: video.description,
          channelTitle: video.channelTitle,
          language: video.language,
          lengthType,
        }),
      })

      const data = await res.json()
      if (data.summary) {
        setSummary({
          id: data.id || '',
          videoId: video.id,
          userId: '',
          summaryKo: data.summary,
          keyPoints: data.keyPoints || [],
          readingTime: data.readingTime || '30초',
          lengthType,
          createdAt: new Date().toISOString(),
        })
        setExpanded(true)
      }
    } catch (err) {
      console.error('Summarize error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card group animate-fade-in">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 relative w-36 h-24 rounded-xl overflow-hidden bg-gray-800 block"
        >
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900" />
          )}
          {video.durationSeconds > 0 && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
              {formatDuration(video.durationSeconds)}
            </div>
          )}
        </a>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge badge-${video.language}`}>
                  {flag} {langLabel}
                </span>
                <span className="text-xs text-gray-500">{video.channelTitle}</span>
              </div>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold text-sm leading-snug hover:text-purple-300 transition-colors line-clamp-2 block"
              >
                {video.title}
              </a>
            </div>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-gray-600 hover:text-gray-400 transition-colors mt-0.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {video.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViewCount(video.viewCount)}
              </span>
            )}
            {video.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(video.publishedAt)}
              </span>
            )}
            {summary && (
              <span className="text-purple-400 font-medium">
                AI {summary.readingTime} 읽기
              </span>
            )}
          </div>

          {/* Summary Toggle Button */}
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                AI 요약 중...
              </>
            ) : summary ? (
              <>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? '요약 접기' : 'AI 요약 보기'}
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                AI 요약 생성
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Expansion */}
      {summary && expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-slide-up">
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{summary.summaryKo}</p>
          {summary.keyPoints.length > 0 && (
            <ul className="space-y-1.5">
              {summary.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-purple-400 font-bold mt-0.5 shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
