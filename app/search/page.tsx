'use client'

import { useState } from 'react'
import { Search, Loader2, Globe, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar'
import VideoCard from '@/components/VideoCard'
import { VideoWithSummary } from '@/lib/types'

type Language = 'all' | 'ko' | 'en' | 'ja' | 'zh'

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: 'all', label: '전체', flag: '🌍' },
  { key: 'ko', label: '한국어', flag: '🇰🇷' },
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'ja', label: '日本語', flag: '🇯🇵' },
  { key: 'zh', label: '中文', flag: '🇨🇳' },
]

interface SearchResults {
  ko: VideoWithSummary[]
  en: VideoWithSummary[]
  ja: VideoWithSummary[]
  zh: VideoWithSummary[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Language>('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActiveVideos = (): VideoWithSummary[] => {
    if (!results) return []
    if (activeTab === 'all') {
      return [...results.ko, ...results.en, ...results.ja, ...results.zh]
    }
    return results[activeTab] || []
  }

  const getCount = (lang: Language) => {
    if (!results) return 0
    if (lang === 'all') {
      return Object.values(results).flat().length
    }
    return results[lang]?.length || 0
  }

  const activeVideos = getActiveVideos()

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            다국어 영상 검색
          </h1>
          <p className="text-gray-400 text-sm">
            한국어·영어·일본어·중국어 영상을 동시에 검색하고 AI로 번역 요약
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어를 입력하세요 (예: AI agent 2024)"
                className="input pl-11 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary px-6 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>
        </form>

        {/* Language Tabs */}
        {searched && results && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {LANGUAGES.map((lang) => {
              const count = getCount(lang.key)
              return (
                <button
                  key={lang.key}
                  onClick={() => setActiveTab(lang.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === lang.key
                      ? 'bg-purple-600 text-white shadow shadow-purple-500/30'
                      : 'glass text-gray-400 hover:text-white glass-hover'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === lang.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">4개 언어로 동시 검색 중...</p>
            </div>
          </div>
        )}

        {!loading && searched && results && (
          <>
            {activeVideos.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">
                    <strong className="text-white">{activeVideos.length}개</strong> 영상 발견 — 각 영상의 AI 요약 버튼을 클릭하세요
                  </span>
                </div>
                <div className="space-y-3">
                  {activeVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </>
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">검색 결과가 없습니다.</p>
                <p className="text-gray-600 text-sm mt-1">다른 검색어를 시도해보세요.</p>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!searched && (
          <div className="glass rounded-2xl p-12 text-center mt-4">
            <Globe className="w-14 h-14 text-blue-500/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">다국어 영상 검색</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
              검색어를 입력하면 한국어, 영어, 일본어, 중국어 유튜브 영상을 동시에 검색합니다.
              <br />
              각 영상의 &ldquo;AI 요약 생성&rdquo; 버튼으로 한국어 번역 요약을 받아보세요.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 text-sm text-gray-500">
              {['🇰🇷 한국어', '🇺🇸 English', '🇯🇵 日本語', '🇨🇳 中文'].map((lang) => (
                <span
                  key={lang}
                  className="glass px-3 py-1.5 rounded-lg text-gray-400"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
