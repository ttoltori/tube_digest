# Cascade Chat Conversation

  Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

Authentication → Providers → Google 활성화
Google Cloud Console에서 OAuth 2.0 Client ID 발급
승인된 리다이렉트 URI: https://[your-project].supabase.co/auth/v1/callback

자세히 안내해줘

*Listed directory [tube_digest](file:///c:/project_j/tube_digest) *

*Viewed [.env.example](file:///c:/project_j/tube_digest/.env.example) *

*Viewed [.env.local](file:///c:/project_j/tube_digest/.env.local) *

*Viewed [schema.sql](file:///c:/project_j/tube_digest/supabase/schema.sql) *

*Searched filesystem*

*Searched filesystem*

*Listed directory [auth](file:///c:/project_j/tube_digest/app/auth) *

*Viewed [client.ts](file:///c:/project_j/tube_digest/lib/supabase/client.ts) *

*Viewed [route.ts](file:///c:/project_j/tube_digest/app/auth/callback/route.ts) *

*Viewed [page.tsx](file:///c:/project_j/tube_digest/app/auth/login/page.tsx) *

### Planner Response

프로젝트 구조를 파악했습니다. TubeDigest AI는 Google OAuth + YouTube 스코프를 사용합니다. 단계별로 상세히 안내합니다.

---

# Google OAuth 설정 완전 가이드

## 이 프로젝트의 특수사항

`@c:\project_j\tube_digest\app\auth\login\page.tsx:13`에서 일반 Google 로그인이 아닌 **YouTube 읽기 권한까지 요청**합니다:
```ts
scopes: 'https://www.googleapis.com/auth/youtube.readonly'
```
→ Google Cloud Console에서 **YouTube Data API v3도 함께** 활성화해야 합니다.

---

## STEP 1 — Google Cloud Console 프로젝트 설정

1. **[console.cloud.google.com](https://console.cloud.google.com)** 접속
2. 상단 프로젝트 선택 드롭다운 → **"새 프로젝트"**
   - 이름: `TubeDigest` (자유롭게)
3. 프로젝트 생성 후 해당 프로젝트로 전환

---

## STEP 2 — OAuth 동의 화면 구성

> 좌측 메뉴: **APIs & Services → OAuth consent screen**

| 항목 | 값 |
|---|---|
| User Type | **External** 선택 후 CREATE |
| App name | `TubeDigest AI` |
| User support email | 본인 Gmail |
| Developer contact email | 본인 Gmail |

**Scopes 추가** (중요):
- `../auth/userinfo.email`
- `../auth/userinfo.profile`
- `openid`
- **`https://www.googleapis.com/auth/youtube.readonly`** ← 반드시 추가

**Test users** 탭:
- 개발 중에는 본인 Gmail 추가 (External 앱은 심사 전 테스트 유저만 로그인 가능)

---

## STEP 3 — YouTube Data API v3 활성화

> 좌측: **APIs & Services → Library**

1. `YouTube Data API v3` 검색
2. **Enable** 클릭

---

## STEP 4 — OAuth 2.0 Client ID 발급

> 좌측: **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**

| 항목 | 값 |
|---|---|
| Application type | **Web application** |
| Name | `TubeDigest Web Client` |
| Authorized JavaScript origins | `http://localhost:3000` (개발) |
| **Authorized redirect URIs** | 아래 참고 |

**Authorized redirect URIs** — **2개 모두** 추가:

```
https://[your-project-ref].supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

> Supabase URL 확인: `@c:\project_j\tube_digest\.env.local:2`의 `NEXT_PUBLIC_SUPABASE_URL` 값에서 확인
> 예: URL이 `https://abcdefgh.supabase.co`이면 → `https://abcdefgh.supabase.co/auth/v1/callback`

**CREATE** 클릭 → **Client ID**와 **Client Secret** 복사

---

## STEP 5 — Supabase Dashboard 설정

> **[supabase.com/dashboard](https://supabase.com/dashboard)** → 프로젝트 선택

1. 좌측 **Authentication → Providers**
2. **Google** 클릭 → **Enable** 토글 ON
3. 입력:
   - **Client ID (for OAuth)**: Step 4에서 복사한 Client ID
   - **Client Secret**: Step 4에서 복사한 Client Secret
4. **Save** 클릭

---

## STEP 6 — .env.local 업데이트

`@c:\project_j\tube_digest\.env.local`의 placeholder 값들을 실제 값으로 교체:

```
NEXT_PUBLIC_SUPABASE_URL=https://[실제-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[실제-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[실제-service-role-key]
NEXT_PUBLIC_APP_URL=http://localhost:3000
YOUTUBE_API_KEY=[Step 3에서 활성화한 프로젝트의 API 키]
```

> Supabase 키 위치: Dashboard → **Settings → API**

---

## STEP 7 — Supabase SQL 스키마 실행

`@c:\project_j\tube_digest\supabase\schema.sql:1-164`의 SQL을 아직 실행 안 했다면:
> Supabase Dashboard → **SQL Editor** → 전체 내용 붙여넣기 → **Run**

---

## 체크리스트

- [ ] Google Cloud 프로젝트 생성
- [ ] OAuth 동의 화면 + `youtube.readonly` scope 추가
- [ ] YouTube Data API v3 활성화
- [ ] OAuth Client ID 발급 (redirect URI 2개 추가)
- [ ] Supabase → Google Provider 활성화 + Client ID/Secret 입력
- [ ] [.env.local](file:///c:/project_j/tube_digest/.env.local:0:0-0:0) 실제 값으로 업데이트
- [ ] Supabase SQL 스키마 실행

---

## 주의: YouTube 스코프는 Google 심사 필요

`youtube.readonly`는 **민감한 스코프**입니다. 프로덕션 배포 시 Google OAuth 앱 심사(verification)를 통과해야 합니다. **개발/테스트 단계에서는 Test users에 등록된 계정만** 로그인 가능합니다.

*Viewed [schema.sql](file:///c:/project_j/tube_digest/supabase/schema.sql) *

### User Input

NEXT_PUBLIC_SUPABASE_ANON_KEY=[실제-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[실제-service-role-key]

위 값은 어디서 얻지?

### Planner Response

## Supabase API 키 찾는 위치

**Supabase Dashboard → 해당 프로젝트 선택 → 좌측 메뉴 Settings → API**

직접 링크:
```
https://supabase.com/dashboard/project/[your-project-ref]/settings/api
```

---

해당 페이지에서 확인할 수 있는 값들:

| [.env.local](file:///c:/project_j/tube_digest/.env.local:0:0-0:0) 변수 | Dashboard 항목 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project API keys → anon / public** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project API keys → service_role / secret** |

---

## 주의사항

- **`anon` 키** → 클라이언트(브라우저)에 노출되어도 됨. RLS(Row Level Security)가 보호막 역할
- **`service_role` 키** → **절대 클라이언트에 노출 금지**. RLS를 우회하므로 서버 사이드(`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_` 접두사 없음)에서만 사용
- [.gitignore](file:///c:/project_j/tube_digest/.gitignore:0:0-0:0)에 [.env.local](file:///c:/project_j/tube_digest/.env.local:0:0-0:0)이 포함되어 있는지 확인 필요

`@c:\project_j\tube_digest\.gitignore`에 [.env.local](file:///c:/project_j/tube_digest/.env.local:0:0-0:0)이 있는지 확인해두세요.

*Viewed [.gitignore](file:///c:/project_j/tube_digest/.gitignore) *

### User Input

OPENAI_API_KEY=sk-...

이건 어떻게 얻지?

### Planner Response

## OpenAI API 키 발급

**[platform.openai.com/api-keys](https://platform.openai.com/api-keys)** 접속

1. 로그인 (없으면 회원가입)
2. **+ Create new secret key** 클릭
3. 이름 입력 (예: `TubeDigest`) → **Create secret key**
4. 키 복사 (`sk-...` 형태) — **이 창 닫으면 다시 볼 수 없음**

---

## 주의사항

- **유료** 서비스 — 사용량만큼 과금 (pay-as-you-go)
- 처음 가입 시 $5 크레딧 제공 (기간 한정)
- 잔액 확인: [platform.openai.com/usage](https://platform.openai.com/usage)
- 한도 설정 권장: **Settings → Limits → Monthly budget** 설정해두면 과금 폭탄 방지

---

## 이 프로젝트에서 사용하는 모델 확인

*Viewed [openai.ts](file:///c:/project_j/tube_digest/lib/openai.ts) *

### Planner Response

`@c:\project_j\tube_digest\lib\openai.ts:61`에서 **`gpt-4o-mini`** 모델 사용 중입니다.

요약 1회 호출 기준 약 **$0.0001~0.001** 수준으로 매우 저렴합니다. 테스트 용도면 기본 크레딧으로 충분히 사용 가능합니다.