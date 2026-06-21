import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TubeDigest AI — 1시간 영상을 1분으로',
  description:
    '내 유튜브 구독 채널을 AI가 자동 요약하고, 영어·일본어·중국어 영상까지 번역 요약해드립니다.',
  keywords: ['유튜브 요약', 'AI 요약', '유튜브 번역', '구독 채널 요약'],
  openGraph: {
    title: 'TubeDigest AI',
    description: '1시간 영상을 1분으로 — AI 유튜브 요약 서비스',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
