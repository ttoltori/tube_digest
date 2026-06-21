'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, Globe, Clock, Loader2, Check, Settings } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

interface Keyword {
  id: string
  keyword: string
  enabled: boolean
  matchCount: number
}

interface Settings {
  languages: string[]
  summaryLength: 'short' | 'medium' | 'long'
  notifications: {
    morningDigest: boolean
    keywordAlerts: boolean
    weeklyReport: boolean
  }
}

const LANGUAGE_OPTIONS = [
  { key: 'ko', label: '한국어', flag: '🇰🇷' },
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'ja', label: '日本語', flag: '🇯🇵' },
  { key: 'zh', label: '中文', flag: '🇨🇳' },
]

export default function SettingsPage() {
  const supabase = createClient()

  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [settings, setSettings] = useState<Settings>({
    languages: ['ko', 'en'],
    summaryLength: 'short',
    notifications: {
      morningDigest: true,
      keywordAlerts: true,
      weeklyReport: false,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profile }, { data: kws }] = await Promise.all([
      supabase.from('profiles').select('settings').eq('id', user.id).single(),
      supabase.from('keywords').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    if (profile?.settings) {
      setSettings(profile.settings)
    }
    if (kws) {
      setKeywords(kws.map((k: any) => ({
        id: k.id,
        keyword: k.keyword,
        enabled: k.enabled,
        matchCount: k.match_count || 0,
      })))
    }
    setLoading(false)
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleAddKeyword = async () => {
    const kw = newKeyword.trim()
    if (!kw || keywords.some((k) => k.keyword === kw)) return

    const res = await fetch('/api/settings/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: kw }),
    })
    const data = await res.json()
    if (data.keyword) {
      setKeywords([{ id: data.keyword.id, keyword: kw, enabled: true, matchCount: 0 }, ...keywords])
      setNewKeyword('')
    }
  }

  const handleToggleKeyword = async (id: string, enabled: boolean) => {
    setKeywords(keywords.map((k) => (k.id === id ? { ...k, enabled: !enabled } : k)))
    await fetch(`/api/settings/keywords/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    })
  }

  const handleDeleteKeyword = async (id: string) => {
    setKeywords(keywords.filter((k) => k.id !== id))
    await fetch(`/api/settings/keywords/${id}`, { method: 'DELETE' })
  }

  const toggleLanguage = (lang: string) => {
    setSettings((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            설정
          </h1>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? '저장됨!' : saving ? '저장 중...' : '저장'}
          </button>
        </div>

        {/* Keywords Section */}
        <section className="glass rounded-2xl p-6 mb-5">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            관심 키워드 알림
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            등록된 키워드가 포함된 영상이 올라오면 알림을 받습니다.
          </p>

          {/* Add Keyword */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="키워드 입력 (예: GPT-5, AI 에이전트)"
              className="input flex-1 text-sm"
            />
            <button
              onClick={handleAddKeyword}
              disabled={!newKeyword.trim()}
              className="btn-primary px-4 shrink-0"
            >
              <Plus className="w-4 h-4" />
              추가
            </button>
          </div>

          {/* Keyword List */}
          <div className="space-y-2">
            {keywords.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                등록된 키워드가 없습니다. 위에서 추가하세요.
              </p>
            ) : (
              keywords.map((kw) => (
                <div
                  key={kw.id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleKeyword(kw.id, kw.enabled)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        kw.enabled
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-600'
                      }`}
                    >
                      {kw.enabled && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`text-sm font-medium ${kw.enabled ? 'text-white' : 'text-gray-500'}`}>
                      {kw.keyword}
                    </span>
                    {kw.matchCount > 0 && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                        {kw.matchCount}개 매칭
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteKeyword(kw.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Language Section */}
        <section className="glass rounded-2xl p-6 mb-5">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            검색 언어 설정
          </h2>
          <p className="text-sm text-gray-500 mb-4">다국어 검색 시 포함할 언어를 선택하세요.</p>

          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_OPTIONS.map((lang) => {
              const selected = settings.languages.includes(lang.key)
              return (
                <button
                  key={lang.key}
                  onClick={() => toggleLanguage(lang.key)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? 'bg-purple-600/20 border-purple-500/40 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {selected && <Check className="w-4 h-4 text-purple-400 ml-auto" />}
                </button>
              )
            })}
          </div>
        </section>

        {/* Summary Length */}
        <section className="glass rounded-2xl p-6 mb-5">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            요약 길이
          </h2>
          <p className="text-sm text-gray-500 mb-4">AI 요약의 세부 수준을 선택하세요.</p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'short', label: '짧게', desc: '30초 읽기', points: '3~5개' },
              { key: 'medium', label: '보통', desc: '1분 읽기', points: '5~7개' },
              { key: 'long', label: '자세히', desc: '3분 읽기', points: '7~10개' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSettings((p) => ({ ...p, summaryLength: option.key as any }))}
                className={`p-3 rounded-xl border text-center transition-all ${
                  settings.summaryLength === option.key
                    ? 'bg-purple-600/20 border-purple-500/40 text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="font-semibold text-sm mb-0.5">{option.label}</div>
                <div className="text-xs opacity-70">{option.desc}</div>
                <div className="text-xs opacity-50 mt-0.5">핵심 {option.points}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            알림 설정
          </h2>
          <p className="text-sm text-gray-500 mb-4">어떤 알림을 받을지 설정합니다.</p>

          <div className="space-y-3">
            {[
              { key: 'morningDigest', label: '아침 8시 요약 메일', desc: '매일 아침 구독 채널 요약을 이메일로 받습니다' },
              { key: 'keywordAlerts', label: '실시간 키워드 알림', desc: '등록된 키워드 관련 영상 업로드 시 알림' },
              { key: 'weeklyReport', label: '주간 리포트 (일요일)', desc: '한 주 동안 절약한 시간 등 통계 리포트' },
            ].map((item) => {
              const enabled = settings.notifications[item.key as keyof typeof settings.notifications]
              return (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [item.key]: !enabled,
                        },
                      }))
                    }
                    className={`relative shrink-0 w-11 h-6 rounded-full transition-colors mt-0.5 ${
                      enabled ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Save Button (bottom) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary px-8"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saved ? '저장됨!' : saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
