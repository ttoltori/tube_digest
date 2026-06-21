# TubeDigest AI 🎬

> 1시간 유튜브 영상을 1분 AI 요약으로 — 구독 채널 자동 요약 + 다국어 번역 요약 서비스

## 기술 스택

- **Frontend / Backend**: Next.js 14 (App Router) → Vercel 배포
- **Database + Auth**: Supabase (PostgreSQL + Google OAuth)
- **AI 요약**: OpenAI GPT-4o-mini
- **YouTube**: YouTube Data API v3

## 빠른 시작

### 1. 패키지 설치

```bash
cd tubedigest
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

필요한 키:
| 변수 | 발급처 | 설명 |
|------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 설정 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 프로젝트 설정 | Supabase anon key |
| `OPENAI_API_KEY` | platform.openai.com | GPT-4o-mini 사용 |
| `YOUTUBE_API_KEY` | Google Cloud Console | YouTube Data API v3 |
| `NEXT_PUBLIC_APP_URL` | - | 배포 URL (예: https://tubedigest.vercel.app) |

### 3. Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 전체 실행
3. **Authentication → Providers → Google** 활성화
   - Google Cloud Console에서 OAuth 2.0 Client ID 발급
   - 승인된 리다이렉트 URI: `https://[your-project].supabase.co/auth/v1/callback`

### 4. Google Cloud Console 설정 (YouTube API)

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성
3. **API 및 서비스 → 라이브러리** → YouTube Data API v3 활성화
4. **사용자 인증 정보** → API 키 생성 → `YOUTUBE_API_KEY`에 설정
5. **OAuth 2.0 클라이언트 ID** 생성 (웹 애플리케이션 타입)
   - 승인된 리다이렉트 URI에 Supabase 콜백 URL 추가
   - Supabase Google Provider에 Client ID & Secret 입력

### 5. 로컬 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

## Vercel 배포

### 방법 1: Vercel CLI

```bash
npm i -g vercel
vercel --cwd tubedigest
```

### 방법 2: GitHub 연동

1. GitHub에 푸시
2. [vercel.com](https://vercel.com)에서 Import
3. Root Directory를 `tubedigest`로 설정
4. Environment Variables에 `.env.local` 내용 모두 추가
5. Deploy

### Vercel 환경 변수 (필수)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
YOUTUBE_API_KEY=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 주요 기능

| 페이지 | 기능 |
|--------|------|
| `/` | 랜딩 페이지 (요금제 포함) |
| `/auth/login` | Google OAuth 로그인 |
| `/dashboard` | 구독 채널 최신 영상 + AI 요약 |
| `/search` | 4개 언어 동시 검색 + AI 번역 요약 |
| `/settings` | 키워드 알림, 언어, 요약 길이 설정 |

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/summarize` | 영상 AI 요약 생성 (캐싱 포함) |
| GET | `/api/search?q=...` | 다국어 유튜브 검색 |
| POST | `/api/settings` | 사용자 설정 저장 |
| POST | `/api/settings/keywords` | 키워드 추가 |
| PATCH | `/api/settings/keywords/[id]` | 키워드 활성화/비활성화 |
| DELETE | `/api/settings/keywords/[id]` | 키워드 삭제 |

## 주의사항

- YouTube 구독 목록은 Google OAuth 로그인 시 `youtube.readonly` 권한 필요
- YouTube API 무료 할당량: 일 10,000 units (search.list = 100 units/call)
- OpenAI API 과금 발생 (GPT-4o-mini 기준 약 $0.00015/1K tokens)
- 요약 결과는 Supabase에 캐싱되어 동일 영상 재요청 시 API 비용 없음
