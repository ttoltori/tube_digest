import Link from 'next/link'
import { Play, Zap, Globe, Bell, Clock, ChevronRight, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-700/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-700/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-xl text-white">TubeDigest AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            로그인
          </Link>
          <Link
            href="/auth/login"
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            무료로 시작하기
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
          <Zap className="w-3.5 h-3.5" />
          <span>AI 기반 유튜브 자동 요약 서비스</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          1시간 영상을
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            1분으로
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          내 유튜브 구독 채널을 AI가 자동 요약하고,{' '}
          <strong className="text-gray-200">영어·일본어·중국어 영상</strong>까지 번역 요약해드립니다.
          정보 홍수에서 핵심만 빠르게 파악하세요.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="btn-primary text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
          >
            <span>Google로 무료 시작</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            기능 살펴보기
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-16 text-sm text-gray-500">
          {[
            { label: '절약 시간', value: '2시간+/일' },
            { label: '지원 언어', value: '4개 언어' },
            { label: '요약 정확도', value: '90%+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-4">핵심 기능</h2>
        <p className="text-center text-gray-500 mb-14">
          정보 과부하 시대, AI가 대신 봐드립니다
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Bell className="w-6 h-6" />,
              title: '구독 채널 AI 자동 요약',
              desc: '내가 구독한 채널의 새 영상을 AI가 자동으로 요약하여 보여드립니다. 핵심 포인트만 30초에 파악하세요.',
              badge: '핵심 기능',
              color: 'purple',
            },
            {
              icon: <Globe className="w-6 h-6" />,
              title: '다국어 번역 요약',
              desc: '영어, 일본어, 중국어 영상도 검색하고 한국어로 번역 요약해드립니다. 언어 장벽 없이 전 세계 콘텐츠를.',
              badge: '다국어 지원',
              color: 'blue',
            },
            {
              icon: <Bell className="w-6 h-6" />,
              title: '키워드 알림',
              desc: '관심 키워드를 등록하면 관련 영상이 올라올 때 자동으로 요약해서 알려드립니다.',
              badge: '개인화',
              color: 'pink',
            },
          ].map((feature, i) => (
            <div key={i} className="card group">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'purple'
                    ? 'bg-purple-500/20 text-purple-400'
                    : feature.color === 'blue'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-pink-500/20 text-pink-400'
                }`}
              >
                {feature.icon}
              </div>
              <span
                className={`badge mb-3 ${
                  feature.color === 'purple'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : feature.color === 'blue'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                } border`}
              >
                {feature.badge}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">오늘의 요약 피드 예시</span>
          </div>

          <div className="space-y-4">
            {[
              {
                channel: '@AI뉴스채널',
                title: 'GPT-5 출시 임박 - 멀티모달 강화, 추론 2배',
                duration: '32분',
                readTime: '45초 읽기',
                points: ['GPT-5는 하반기 출시 예정', '멀티모달 기능 대폭 강화', '추론 능력 2배 향상'],
                lang: '🇰🇷',
              },
              {
                channel: 'TechDaily',
                title: 'The Future of AI Agents (영어 → 한국어 번역)',
                duration: '28분',
                readTime: '1분 읽기',
                points: ['AI 에이전트는 자율 의사결정 단계로 발전', 'AutoGPT 등 오픈소스 생태계 급성장', '기업용 B2B 에이전트 시장 2025년 $10B 예상'],
                lang: '🇺🇸',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-500 mr-2">
                      {item.lang} {item.channel}
                    </span>
                    <h4 className="text-white font-semibold mt-1">{item.title}</h4>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs text-gray-500">영상 {item.duration}</div>
                    <div className="text-xs text-purple-400 font-medium">AI {item.readTime}</div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {item.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              오늘 절약한 시간:{' '}
              <strong className="text-green-400">1시간 3분</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-4">요금제</h2>
        <p className="text-center text-gray-500 mb-14">무료로 시작하고 필요할 때 업그레이드하세요</p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Free',
              price: '무료',
              features: ['하루 10개 영상 요약', '한국어 채널만', '기본 검색'],
              cta: '무료 시작',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '₩9,900',
              period: '/월',
              features: ['무제한 요약', '4개 언어 번역', '키워드 알림', '아침 요약 메일', '주간 리포트'],
              cta: 'Pro 시작하기',
              highlight: true,
            },
            {
              name: 'Premium',
              price: '₩19,900',
              period: '/월',
              features: ['Pro 전체 포함', 'API 제공', '팀 공유 기능', '커스텀 요약 설정', '전담 지원'],
              cta: 'Premium 시작',
              highlight: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 border ${
                plan.highlight
                  ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'glass'
              }`}
            >
              {plan.highlight && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400">인기</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                className={`w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all block ${
                  plan.highlight
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow shadow-purple-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-400 mb-8">
            무료 플랜으로 AI 유튜브 요약을 경험해보세요
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            Google로 시작하기
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Play className="w-4 h-4 fill-gray-600" />
          <span className="font-bold">TubeDigest AI</span>
        </div>
        <p>© 2024 TubeDigest AI. AI 유튜브 콘텐츠 큐레이션 서비스.</p>
      </footer>
    </div>
  )
}
