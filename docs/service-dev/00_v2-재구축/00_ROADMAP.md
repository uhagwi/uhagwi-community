# 우하귀 v2 재구축 로드맵 — #28 service-dev 협업

> **출처**: [[우하귀-사업화]] (#34 위키) 사업 모델 10건 정렬 결과 (2026-05-02)
> **작업 본부**: 본 디렉토리 (`uhagwi/docs/service-dev/00_v2-재구축/`)
> **협업 하네스**: #28 service-dev (이미 #33에 주입됨, `.claude/service-dev/`)
> **트리거**: 다음 세션에서 *"우하귀 v2 재구축 시작"* 또는 *"#28 design-ui 호출"*

---

## v1 → v2 본질 변화

| 항목 | v1 (현재) | v2 (목표) |
|---|---|---|
| 정체성 | "AI 하네스 갤러리 — 내 하네스 보러 올래?" | "AI가 진단하고, AI가 일한다" |
| 본질 | 사람 빌더 자랑·SNS | AI 진단 + AI 실행 SaaS |
| 진입 | Discord OAuth만 | Google·Kakao·Naver·Discord (locale 분기) |
| 사용자 행동 | 갤러리에서 하네스 자랑 | 진단 받고 → MCP로 자기 환경에서 일 시킴 |
| 결제 | 없음 | $9/월 호출량 무제한 |
| 락인 | 평판·SNS | 살아있는 인터뷰 + creature 진화 |

---

## 작업 단계 — #28 8 그룹 적용

### Phase 1. **plan** (이미 완료 — Phase A + 사업 모델 10건)
- [x] Phase A 본인 자가검증 (KPI 3/3 통과)
- [x] 차별화 1줄 + 전환 funnel + 락인 + 인터뷰 갱신 + 다마고치 관계 결정
- [x] 진입 채널 + 결제 게이트 + Stage 1 페이지 + 인증 + SNS 결정
- [x] 사업기획서 v1.docx 출력
- [x] 메인 페이지 헤드라인 v2로 변경 (2026-05-02)

### Phase 2. **design** (#28 designer-ui·designer-api·designer-erd·designer-scenario)

#### 2.1 design-ui — Stage 1 결과 페이지 (`/result`)
- [ ] 와이어프레임: A 페르소나 코드 + B creature + C 자동화 톱5 + F 시간 절약 + J 즉시 시연
- [ ] 페이지 끝 3 행동 버튼 (자랑·MCP·Pro)
- [ ] 결과 카드 자동 이미지 생성 (`og:image` + 인스타 9:16) — #26 비주얼 생성기 호출
- [ ] 빈 상태·로딩·에러 상태
- **트리거**: `#28 design-ui` 또는 *"Stage 1 결과 페이지 와이어프레임"*

#### 2.2 design-ui — 메인 랜딩 v2
- [x] 헤드라인 변경 (2026-05-02)
- [ ] §2~§6 섹션 v2 카피 재작성 (자동화 비유 → 진단·실행 비유로)
- [ ] CTA 변경 (Discord 입장 → 무료 진단 시작)
- [ ] hero 비주얼 — 바다사자 그대로 vs creature 진화 시각화 결정
- **트리거**: `#28 design-ui` 또는 *"랜딩 v2 카피 재작성"*

#### 2.3 design-api — MCP 서버 + 결제 + OAuth
- [ ] MCP 서버 SPEC (Claude Desktop·Cursor 호환, 도구 5종: replicator-run·persona-recall·creature-feed·candidate-suggest·call-counter)
- [ ] 결제 API SPEC (Stripe·Toss 듀얼, 호출량 카운터, Pro 전환)
- [ ] OAuth 4 provider config (Google·Kakao·Naver·Discord)
- [ ] `/api/lab/publish` 갱신 (creature ↔ 인터뷰 갱신 시그널 매핑)
- **트리거**: `#28 design-api`

#### 2.4 design-erd — DB 스키마 v2
- [ ] users 테이블 — 4 OAuth provider id 컬럼 추가 (kakao_id·naver_id·google_id·discord_id 또는 통합 oauth_accounts 테이블)
- [ ] interviews 테이블 신설 — 살아있는 인터뷰 컨텍스트 누적 (jsonb)
- [ ] creature 테이블 — food 5종 ↔ 인터뷰 시그널 매핑
- [ ] mcp_calls 테이블 — 호출량 결제 카운터
- [ ] subscriptions 테이블 — Pro/Team/Enterprise
- **트리거**: `#28 design-erd`

#### 2.5 design-scenario — E2E 시나리오 5종
- [ ] 신규 가입 → 진단 → creature 부여 → 시연 1개 → MCP 설치
- [ ] Pro 결제 → 호출량 무제한 → 인터뷰 깊어짐
- [ ] 친구 자랑 → 인스타 카드 공유 → 신규 유입
- [ ] B2B 발주 → T3 사람 빌더 매칭
- [ ] 무자각 갱신 사이클 (C+E+B 시그널 누적)

### Phase 3. **dev** (#28 dev-fe-web·dev-be-api·dev-be-db·dev-integrate·dev-secure)

#### 3.1 dev-fe-web — 프론트엔드 구현
- [ ] `/result` Stage 1 결과 페이지 (~300줄, 5종 컴포넌트 분할)
- [ ] 메인 랜딩 v2 섹션 카피 적용
- [ ] creature 진화 시각화 (#33 lab 자산 활용)
- [ ] 로그인 UI 4 버튼 + locale 분기
- [ ] 인스타 9:16 카드 자동 생성
- **트리거**: `#28 dev-fe-web` 또는 SPEC 기반 `/auto go`

#### 3.2 dev-be-api — MCP 서버 신설
- [ ] MCP 서버 패키지 신설 (`apps/mcp-server/` 또는 `packages/mcp/`)
- [ ] 도구 5종 구현
- [ ] Claude Desktop 등록 가이드
- **트리거**: `#28 dev-be-api`

#### 3.3 dev-be-api — 결제 통합
- [ ] Stripe + Toss 듀얼 결제 (지역별 분기)
- [ ] 호출량 카운터 (Upstash Redis sliding window 활용)
- [ ] Pro/Team/Enterprise 전환 플로우
- **트리거**: `#28 dev-be-api`

#### 3.4 dev-be-db — Supabase 마이그레이션
- [ ] interviews·creatures·mcp_calls·subscriptions 테이블 신설
- [ ] users 테이블 oauth_accounts 분리
- [ ] RLS 정책 갱신
- **트리거**: `#28 dev-be-db`

#### 3.5 dev-integrate — OAuth 4 provider
- [ ] NextAuth config: Google·Kakao(별도 패키지)·Naver(직접 OAuthConfig)·Discord 유지
- [ ] 로그인 UI locale 분기 (한국어 = Google·Kakao·Naver / 영어 = Google·Discord)
- [ ] 사용자가 외부 키 등록 필요 (Kakao Developers·Naver Developers)
- **트리거**: `#28 dev-integrate`

#### 3.6 dev-secure — 살아있는 인터뷰 프라이버시 가드
- [ ] 투명성 페이지 — *"내 인터뷰 현재 상태"* 열람
- [ ] 항목별 옵트아웃 (food 5종 카테고리 끄기)
- [ ] export 가능 (텍스트 다운로드, but 살아있는 컨텍스트는 export 불가)
- **트리거**: `#28 dev-secure`

### Phase 4. **deploy + launch** (#28 deploy-edge·launch-checklist·launch-domain)
- [ ] Vercel 배포 환경변수 갱신 (Kakao·Naver client id·secret)
- [ ] MCP 서버 호스팅 결정 (Vercel Edge Functions 또는 Railway)
- [ ] 도메인 검토 (uhagwi.com·uhagwi.ai 등 — 현재 vercel.app 자체 도메인)
- [ ] Phase B 베타 30~50명 모집 채널 가동 (퍼스널 브랜딩 4 SNS)

### Phase 5. **maintain + money** (#28 launch-checklist·monitoring·monetization)
- [ ] 호출량 결제 KPI 추적 (전환율·월 ARPU)
- [ ] creature 진화 ↔ 인터뷰 갱신 효과 측정 (락인 효과 검증)
- [ ] 박사논문 케이스 챕터 데이터 수집 (사용자 동의 + 익명화)

---

## 즉시 적용된 변경 (2026-05-02)

| 파일 | 변경 |
|---|---|
| `apps/web/src/app/page.tsx` | 메인 헤드라인 *"내 하네스 보러 올래?"* → *"AI가 진단하고, AI가 일한다"* + 카피 + CTA |

→ Vercel 자동 배포되면 [https://uhagwi-community.vercel.app](https://uhagwi-community.vercel.app) 에 즉시 반영. 배포는 `git commit + push` 필요 — 다음 세션에 결정.

---

## 다음 세션 진입점

복귀 시 다음 한 마디 중 하나:

| 트리거 | 작업 |
|---|---|
| *"우하귀 v2 재구축 시작 — Phase 2 design부터"* | 본 ROADMAP §Phase 2 진입 |
| *"우하귀 design-ui — 결과 페이지 와이어프레임"* | §2.1 단독 |
| *"우하귀 design-erd — DB 스키마 v2"* | §2.4 단독 |
| *"우하귀 dev-integrate — OAuth 4 provider 추가"* | §3.5 단독 (외부 키 등록 후) |
| *"우하귀 v2 메인 변경 commit·push"* | 즉시 적용된 변경 배포 |

---

## 작업 시간 산정 (현실)

| Phase | 예상 시간 | 비고 |
|---|---|---|
| Phase 1 plan | ✅ 완료 | 1.5일 |
| Phase 2 design (5 단계) | 6~10시간 | SPEC + 와이어프레임 + ERD |
| Phase 3 dev (6 단계) | 25~40시간 | 메인 코드 작업 |
| Phase 4 deploy + launch | 4~8시간 | 환경변수·도메인·MCP 호스팅 |
| Phase 5 maintain + money | 분기 단위 지속 | KPI·박사논문 데이터 |
| **총계 (Phase 2~4)** | **35~58시간** | 본인 + AI 협업, 10~15일 분량 |

→ 본인 박사·기존 33 하네스 운영 시간 고려하면 2~3주 분량.

---

## 메타

| 항목 | 값 |
|---|---|
| 작성일 | 2026-05-02 |
| 작성 트리거 | 본인 *"기획대로 사이트 뒤집어 엎어줘 + #28 협업"* 요청 |
| 출처 | [[우하귀-사업화]] §사업 모델 10건 + Phase A 검증 |
| 협업 하네스 | #28 service-dev (주입본 `.claude/service-dev/`) |
| 첫 즉시 적용 | 메인 헤드라인 변경 (2026-05-02) |
