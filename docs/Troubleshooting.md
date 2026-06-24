# TubeDigest AI - Troubleshooting Guide

프로젝트 개발 중 발생한 주요 오류와 해결 방법을 정리한 문서입니다.

---

## 1. 개발 환경 설정 오류

### 1.1 autoprefixer 모듈 누락

**증상**
```
Error: Cannot find module 'autoprefixer'
```

**원인**
- `package.json`의 `devDependencies`에 `autoprefixer`가 누락됨
- Next.js가 CSS 처리 시 autoprefixer를 필요로 하지만 설치되지 않음

**해결 방법**
```bash
npm install autoprefixer --save-dev
```

**참고사항**
- AI 도구의 `run_command`가 Windows 환경에서 npm 명령 실행 시 출력을 제대로 캡처하지 못하는 경우가 있음
- npm 관련 명령은 사용자가 직접 터미널에서 실행하는 것을 권장

---

## 2. Google OAuth 인증 오류

### 2.1 액세스 차단 (403: access_denied)

**증상**
```
액세스 차단됨: ybghmaqjislwizsdocwa.supabase.co은(는) Google 인증 절차를 완료하지 않았습니다
403 오류: access_denied
```

**원인**
- Google OAuth 앱이 **테스트 모드**로 설정되어 있음
- 승인된 테스터만 로그인 가능한 상태

**해결 방법**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 해당 프로젝트 선택
3. **APIs & Services → OAuth consent screen** 이동
4. 하단 **"Test users"** 섹션에서 **"+ ADD USERS"** 클릭
5. 사용할 Gmail 계정 추가 → **Save**

**프로덕션 배포 시**
- OAuth consent screen의 **Publishing status**를 "Testing" → "In production"으로 변경
- 민감한 scope 사용 시 Google 검수 필요

---

### 2.2 인가 코드 교환 실패 (server_error)

**증상**
```
GET /auth/callback?error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code
```

**원인**
- Google Cloud Console의 **Authorized redirect URIs** 설정 누락
- Supabase 콜백 URL이 Google에 등록되지 않음

**해결 방법**

#### Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. OAuth 2.0 Client ID 클릭
3. **Authorized redirect URIs**에 추가:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
4. **Save**

#### Supabase Dashboard 설정
1. [Supabase Dashboard](https://supabase.com/dashboard) → 해당 프로젝트
2. **Authentication → URL Configuration**
3. **Redirect URLs**에 추가:
   ```
   http://localhost:3000/**
   ```
4. **Save**

#### 확인 사항
- Supabase Dashboard → **Authentication → Providers → Google**
- Google Client ID와 Client Secret이 Google Cloud Console의 값과 **정확히 일치**하는지 확인

**Client Secret 찾기**
- Google Cloud Console → Credentials → OAuth 2.0 Client ID 클릭
- Client Secret은 `GOCSPX-...` 형태
- 마스킹되어 보이면 복사 아이콘 또는 "Show secret" 버튼 사용

---

### 2.3 PKCE Code Verifier 오류

**증상**
```
AuthPKCECodeVerifierMissingError: PKCE code verifier not found in storage
```

**원인**
- 클라이언트 컴포넌트에서 `signInWithOAuth` 호출 시 PKCE verifier가 `localStorage`에 저장됨
- 서버 사이드 콜백에서 `localStorage`에 접근 불가
- `@supabase/ssr` v0.3.0이 `getAll`/`setAll` API를 지원하지 않음

**해결 방법**

#### 1. Server Action으로 OAuth 시작 이동

**`app/auth/login/actions.ts` 생성**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      scopes: 'https://www.googleapis.com/auth/youtube.readonly',
    },
  })

  if (error) {
    redirect('/auth/login?error=auth_failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}
```

**`app/auth/login/page.tsx` 수정**
```typescript
import { signInWithGoogle } from './actions'

export default function LoginPage() {
  return (
    <form action={signInWithGoogle}>
      <button type="submit">Sign in with Google</button>
    </form>
  )
}
```

#### 2. @supabase/ssr 패키지 업그레이드

**`package.json` 수정**
```json
{
  "dependencies": {
    "@supabase/ssr": "^0.5.2"
  }
}
```

**설치**
```bash
npm install
```

#### 3. Middleware에서 콜백 경로 제외

**`middleware.ts` 수정**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/callback).*)',
  ],
}
```

**효과**
- Server Action에서 `signInWithOAuth` 호출 시 PKCE verifier가 **cookie**에 저장됨
- 서버 사이드 콜백에서 cookie를 통해 verifier 접근 가능

---

## 3. Supabase RPC 오류

### 3.1 .catch is not a function

**증상**
```
TypeError: supabase.rpc(...).catch is not a function
```

**원인**
- `@supabase/supabase-js`의 `rpc()` 반환값은 Promise가 아닌 `PostgrestFilterBuilder`
- `.catch()`를 직접 체이닝할 수 없음

**해결 방법**

**잘못된 코드**
```typescript
const { data, error } = await supabase
  .rpc('increment_video_summary_count', { video_id: videoId })
  .catch(err => console.error(err))
```

**올바른 코드**
```typescript
const { data, error } = await supabase
  .rpc('increment_video_summary_count', { video_id: videoId })

if (error) {
  console.error('[increment] error:', error)
}
```

---

## 4. OpenAI API 오류

### 4.1 Quota 초과 (429 Error)

**증상**
```
OpenAI API error: 429 - You exceeded your current quota
```

**원인**
- OpenAI 계정의 크레딧 소진

**해결 방법**
1. [OpenAI Billing](https://platform.openai.com/settings/billing) 접속
2. 크레딧 충전
3. 월별 한도 설정 권장 (**Settings → Limits → Monthly budget**)

**참고사항**
- 이 프로젝트는 `gpt-4o-mini` 모델 사용
- 요약 1회당 약 $0.0001~0.001 수준으로 저렴
- 처음 가입 시 $5 크레딧 제공 (기간 한정)

---

## 5. Git 관련 오류

### 5.1 민감정보로 인한 Push 거부

**증상**
- GitHub에서 API 키, Secret 등 민감정보 감지로 push 거부

**원인**
- `docs/ai_setting.md` 파일에 실제 API 키들이 노출됨
- 커밋 객체에 이미 기록됨

**해결 방법**

#### 1. 모든 노출된 키 즉시 재발급
- Google OAuth Client Secret
- YouTube Data API Key
- OpenAI API Key (가장 위험)

#### 2. 커밋에서 민감 파일 제거

```bash
# 커밋 취소 (변경사항은 staged 상태로 보존)
git reset --soft origin/main

# 민감 파일을 index에서 제거 (로컬 파일은 유지)
git rm --cached docs/ai_setting.md

# .gitignore에 추가
echo docs/ai_setting.md >> .gitignore

# 나머지 변경사항 재커밋 후 push
git add .gitignore
git commit -m "refactor: improve auth flow and error handling"
git push origin main
```

---

## 6. 환경별 주의사항

### 6.1 Windows 환경에서 AI 도구 사용

**문제점**
- AI 도구의 `run_command`가 Windows에서 새로운 cmd.exe 프로세스를 생성
- 사용자 터미널과 다른 환경(PATH, 네트워크 설정 등)에서 실행될 수 있음
- npm install 등의 명령이 실제로 실행되지 않거나 출력이 캡처되지 않을 수 있음

**권장 사항**
- npm install, git 명령 등은 사용자가 직접 터미널에서 실행
- 코드 수정, 파일 편집은 AI 도구 활용

### 6.2 localhost vs 프로덕션

**PKCE Verifier 오류는 환경 문제가 아님**
- localhost에서 발생한 PKCE 오류는 Vercel 배포 후에도 동일하게 발생
- 클라이언트 vs 서버 사이드 아키텍처 문제
- Server Action 방식이 프로덕션에서도 올바른 구조

---

## 7. 체크리스트

### 초기 설정 시 확인사항

- [ ] `package.json`에 모든 필수 devDependencies 포함 (`autoprefixer` 등)
- [ ] `.env.local` 파일에 모든 환경 변수 설정
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `YOUTUBE_API_KEY`
- [ ] `.gitignore`에 민감 파일 포함
  - [ ] `.env.local`
  - [ ] `docs/ai_setting.md`
- [ ] Google Cloud Console 설정
  - [ ] OAuth 동의 화면 구성
  - [ ] Test users 추가
  - [ ] YouTube Data API v3 활성화
  - [ ] OAuth 2.0 Client ID 발급
  - [ ] Authorized redirect URIs 등록
- [ ] Supabase Dashboard 설정
  - [ ] Google Provider 활성화
  - [ ] Client ID/Secret 입력
  - [ ] Redirect URLs 설정
  - [ ] SQL 스키마 실행
- [ ] `@supabase/ssr` 버전 확인 (v0.5.2 이상)

### 배포 전 확인사항

- [ ] 모든 API 키가 유효하고 충분한 크레딧/할당량 보유
- [ ] Google OAuth 앱 Publishing status 확인 (프로덕션 배포 시)
- [ ] 민감정보가 Git 히스토리에 없는지 확인
- [ ] 프로덕션 도메인을 Google Authorized redirect URIs에 추가
- [ ] Supabase Redirect URLs에 프로덕션 도메인 추가

---

## 8. 참고 링크

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [OpenAI Platform](https://platform.openai.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [@supabase/ssr Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
