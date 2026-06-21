import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import VideoCard from '@/components/VideoCard'
import { getSubscriptions, getChannelRecentVideos } from '@/lib/youtube'
import { Clock, Youtube, AlertCircle, RefreshCw, Bell, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .order('created_at', { ascending: false })
    .limit(5)

  const youtubeToken = profile?.youtube_access_token
  const settings = profile?.settings || {}

  let subscriptions: any[] = []
  let allVideos: any[] = []
  let youtubeError = false

  if (youtubeToken) {
    try {
      subscriptions = await getSubscriptions(youtubeToken)
      const videoGroups = await Promise.all(
        subscriptions.slice(0, 8).map((sub) => getChannelRecentVideos(sub.channelId, 3))
      )
      allVideos = videoGroups.flat().sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    } catch (err) {
      console.error('YouTube API error:', err)
      youtubeError = true
    }
  }

  const timeSavedMinutes = profile?.total_time_saved_minutes || 0

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar
        user={{ email: user.email, avatar: user.user_metadata?.avatar_url }}
        timeSaved={timeSavedMinutes}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">{today}</p>
            <h1 className="text-2xl font-bold text-white">
              안녕하세요 👋{' '}
              <span className="text-purple-400">
                {user.user_metadata?.name?.split(' ')[0] || '사용자'}
              </span>
              님
            </h1>
          </div>
          {timeSavedMinutes > 0 && (
            <div className="glass rounded-2xl px-4 py-3 text-center hidden sm:block">
              <div className="flex items-center gap-2 text-green-400">
                <Clock className="w-4 h-4" />
                <span className="font-bold">{Math.floor(timeSavedMinutes / 60)}시간 {timeSavedMinutes % 60}분</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">누적 절약 시간</p>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: '구독 채널', value: subscriptions.length || '-', color: 'purple' },
            { label: '오늘 새 영상', value: allVideos.length || '-', color: 'blue' },
            { label: '알림 키워드', value: keywords?.length || 0, color: 'green' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-4 text-center">
              <div
                className={`text-2xl font-bold ${
                  stat.color === 'purple'
                    ? 'text-purple-400'
                    : stat.color === 'blue'
                    ? 'text-blue-400'
                    : 'text-green-400'
                }`}
              >
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* YouTube Not Connected */}
        {!youtubeToken && (
          <div className="glass rounded-2xl p-8 text-center mb-8 border border-yellow-500/20">
            <Youtube className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">YouTube 연동 필요</h3>
            <p className="text-gray-400 text-sm mb-5">
              구독 채널 요약을 사용하려면 YouTube 계정 연동이 필요합니다.
              <br />
              로그아웃 후 다시 Google로 로그인해주세요.
            </p>
            <Link href="/auth/login" className="btn-primary inline-flex">
              YouTube 계정 연동하기
            </Link>
          </div>
        )}

        {/* YouTube Error */}
        {youtubeToken && youtubeError && (
          <div className="glass rounded-2xl p-6 mb-8 border border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">YouTube API 오류</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  YouTube 액세스 토큰이 만료되었습니다. 로그아웃 후 다시 로그인해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Keywords Section */}
        {keywords && keywords.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                관심 키워드
              </h2>
              <Link href="/settings" className="text-xs text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1">
                관리 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw: any) => (
                <div
                  key={kw.id}
                  className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm px-3 py-1.5 rounded-full"
                >
                  <Bell className="w-3 h-3" />
                  {kw.keyword}
                  {kw.match_count > 0 && (
                    <span className="bg-purple-500/30 text-purple-200 text-xs px-1.5 py-0.5 rounded-full ml-1">
                      {kw.match_count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Feed */}
        {allVideos.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                구독 채널 최신 영상
              </h2>
              <span className="text-xs text-gray-500">{allVideos.length}개</span>
            </div>

            <div className="space-y-3">
              {allVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  lengthType={settings.summaryLength || 'short'}
                />
              ))}
            </div>
          </div>
        ) : youtubeToken && !youtubeError ? (
          <div className="glass rounded-2xl p-12 text-center">
            <RefreshCw className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              구독 채널을 불러오는 중이거나 새 영상이 없습니다.
            </p>
          </div>
        ) : null}

        {/* Quick Search CTA */}
        <div className="mt-8 glass rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white mb-1">다국어 영상 검색</p>
            <p className="text-sm text-gray-400">영어·일본어·중국어 영상을 검색하고 AI로 번역 요약</p>
          </div>
          <Link href="/search" className="btn-secondary shrink-0">
            검색하기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
