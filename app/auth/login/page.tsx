'use client'

import { createClient } from '@/lib/supabase/client'
import { Play, Shield, Clock, Globe } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/youtube.readonly',
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-700/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-2xl text-white">TubeDigest AI</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">시작하기</h1>
          <p className="text-gray-400 text-sm">
            Google 계정으로 로그인하면 유튜브 구독 채널에 접근하여<br />
            AI 자동 요약 서비스를 이용할 수 있습니다.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </button>

          {/* Permissions info */}
          <div className="mt-6 space-y-3">
            <p className="text-xs text-gray-500 text-center font-medium">요청되는 권한</p>
            {[
              { icon: <Play className="w-3.5 h-3.5" />, text: '유튜브 구독 채널 목록 조회 (읽기 전용)' },
              { icon: <Shield className="w-3.5 h-3.5" />, text: '영상 재생 또는 계정 수정 권한 없음' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-gray-400">
                <span className="text-purple-400">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: <Clock className="w-4 h-4" />, label: '시간 절약' },
            { icon: <Globe className="w-4 h-4" />, label: '4개 언어' },
            { icon: <Play className="w-4 h-4" />, label: 'AI 요약' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-3">
              <div className="flex justify-center text-purple-400 mb-1">{item.icon}</div>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          로그인하면{' '}
          <span className="text-gray-500 underline cursor-pointer">이용약관</span>
          {' '}및{' '}
          <span className="text-gray-500 underline cursor-pointer">개인정보처리방침</span>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  )
}
