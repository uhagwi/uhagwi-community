# 우하귀 하네스 캐릭터 자동 생성 시스템

> 갤러리 카드 썸네일을 이모지 대신 **AI 생성 캐릭터 이미지**로 자동 채우는 워크플로우.

---

## 🎬 전체 그림

| 단계 | 시점 | 방식 | 상태 |
|------|-----|-----|------|
| Phase 1 | MVP (지금) | **수동 생성** — 프롬프트 따라 Grok/Gemini에서 1분씩 만든 뒤 `public/characters/` 에 저장 | 🟢 진행 중 |
| Phase 2 | DB 연결 후 | **자동 생성** — 새 하네스 등록 시 서버가 본문 분석 → 이미지 API 호출 → Supabase Storage 업로드 → `harness.thumbnail_url` 저장 | ⏳ 설계만 |

`thumbnail_url` 필드는 이미 만들어져 있고, 없으면 emoji fallback. 지금 4개만 생성하면 갤러리·상세 페이지에 자동으로 반영됨.

---

## 📐 캐릭터 디자인 원칙 (4종 공통)

- **톤**: 한국 예능 스티커 + 픽사 셀쉐이딩 + 카카오프렌즈 친근함의 중간
- **컬러 팔레트**: 우하귀 브랜드 (딥퍼플 #5d44a0, 크림 #fffdf7, 민트 #55ccad, 핫핑크 #ff3d85)
- **외곽선**: 두꺼운 검정 또는 짙은 보라 (3~4px)
- **표정**: 큰 눈 + 발그레한 볼 + 살짝 벌린 입
- **배경**: 투명 PNG 또는 단색 cream 배경
- **사이즈**: 정사각형 1024x1024 (Image 컴포넌트가 aspect-video로 자동 컨테인)
- **파일명**: `{slug}.png` 정확히 일치 — 아래 표 참조

| Slug | 페르소나 | 파일 경로 |
|------|---------|---------|
| `verify-harness` | 검증이 | `apps/web/public/characters/verify-harness.png` |
| `improve-harness` | 다듬이 | `apps/web/public/characters/improve-harness.png` |
| `proposal-harness` | 프로포잘 | `apps/web/public/characters/proposal-harness.png` |
| `service-dev-harness` | 서비스쟁이 | `apps/web/public/characters/service-dev-harness.png` |

---

## 🎨 프롬프트 4종 (그록·Gemini Imagen·DALL-E 호환)

각 프롬프트를 그록 또는 Gemini 웹 UI에 그대로 붙여넣고, 결과 PNG를 위 경로에 저장.

### 1. 검증이 (verify-harness.png)

```
Cute mascot character "Verifier" for an AI quality-audit tool.
A round, chubby inspector creature wearing a magnifying-glass monocle and holding a clipboard with a checkmark stamp.
Big sparkly eyes, rosy cheeks, a tiny detective hat.
Body color: deep purple (#5d44a0) with cream (#fffdf7) belly accent.
Thick black outlines, 3D drop shadow, slightly bouncy cel-shaded style — like a Korean variety show sticker meets Pixar.
Sitting pose, peeking through the magnifying glass with a confident smirk.
Hint of mint (#55ccad) glow around it suggesting "all checks passed".
Square 1:1 composition, transparent or soft cream background.
NO text, NO logos.
```

### 2. 다듬이 (improve-harness.png)

```
Cute mascot character "Polisher" for an AI document-refinement tool.
A small fairy-like creature with a tiny chef-style apron, holding a glowing pencil and a magic eraser.
Two iridescent star-shaped wings sparkling with mint (#55ccad) light.
Body color: pastel cream (#fffdf7) with deep purple (#5d44a0) hair tied in a bun.
Big eyes, rosy cheeks, gentle smile — radiating "I'll fix it for you" vibes.
Surrounding sparkles in hot pink (#ff3d85), tiny floating shavings being polished off a paper.
Thick black outlines, cel-shaded, Korean variety show sticker style.
Square 1:1, soft pastel background.
NO text, NO logos.
```

### 3. 프로포잘 (proposal-harness.png)

```
Cute mascot character "Proposal-jjang" for an AI document-generation tool.
A confident, slightly proud little creature hugging a thick stack of paper documents that are taller than itself.
Wearing tiny round spectacles and a small bow tie.
Body color: hot pink (#ff3d85) with cream (#fffdf7) face.
Documents in the stack have visible Korean labels (just abstract horizontal lines, no readable text).
Big eyes shining like "I made this", rosy cheeks, mouth open in cheerful announcement.
Background suggestion: hint of brand purple (#5d44a0) podium or spotlight.
Thick black outlines, drop shadow, Korean sticker-pop style.
Square 1:1.
NO actual readable text in the documents — just abstract lines.
```

### 4. 서비스쟁이 (service-dev-harness.png)

```
Cute mascot character "Service-jaengi" for an AI full-stack scaffolding tool.
A multi-armed, friendly little robot creature with 4-6 small arms each holding a different tool: a wrench, a tiny laptop, a gear, a paint brush, a rocket, a coin (representing the 7 service-dev stages: plan, design, dev, deploy, launch, maintain, money).
Body color: deep purple (#5d44a0) with mint (#55ccad) accent panels.
Big single round LED eye glowing cream (#fffdf7), rosy cheek panels, antenna with a hot-pink (#ff3d85) heart on top.
Excited "I can do everything!" pose, slight tilt forward.
Background: floating gears and code brackets {} in pastel.
Thick black outlines, cel-shaded, Korean variety show sticker style with a touch of retro robot charm.
Square 1:1.
NO readable text, just symbols.
```

---

## 🚀 사용법 (Phase 1 — 수동)

### 1. 그록(Grok) 웹 UI 사용 시
1. https://x.com/i/grok 접속 → 이미지 생성 모드
2. 위 프롬프트 4개를 각각 한 번씩 입력
3. 결과 이미지 우클릭 → 저장
4. 파일명을 표의 정확한 슬러그로 변경(`verify-harness.png` 등)
5. `apps/web/public/characters/` 에 저장
6. 브라우저 새로고침 → 갤러리 카드에 자동 반영

### 2. Gemini Imagen / Google AI Studio 사용 시
1. https://aistudio.google.com/app/prompts/new_chat
2. 모델: `imagen-3.0-generate-002` 또는 후속
3. 위 프롬프트 그대로 입력
4. 동일하게 저장 후 같은 경로에 배치

### 3. 한 번에 4장 자동 생성하고 싶으면
`_scripts/regen_v2_sealion_*.py` 처럼 Python 스크립트를 만들어 Gemini API를 4번 호출. 기존 `_scripts/generate_logo.py` 가 좋은 참고.

---

## 🤖 Phase 2 — 자동 생성 설계 (DB 연결 후)

### 트리거
새 하네스 등록 시 (`POST /api/harnesses` 성공 후 백그라운드 작업).

### 흐름
```
1. 사용자가 하네스 작성 → DB 저장 (status: 'draft')
2. 서버가 비동기로 generateCharacter(harness) 호출
   ├─ 본문 body_md + persona_name + tagline + components 종합
   ├─ Claude Haiku로 한 줄 캐릭터 디자인 brief 추출
   │   (예: "검증이 — 돋보기 든 보라색 통통이")
   ├─ 위 4개 프롬프트 템플릿에 brief 주입 → 최종 프롬프트 완성
   ├─ Gemini Imagen API 호출 (또는 Grok API · DALL-E 3)
   └─ 결과 PNG → Supabase Storage 'characters/{slug}.png' 업로드
3. UPDATE harnesses SET thumbnail_url = '<storage URL>' WHERE id = ?
4. 캐시 무효화 → 갤러리에서 즉시 보임
```

### 비용 통제
- 1장 생성당 ~$0.02 (Imagen) ~ $0.08 (DALL-E 3 HD)
- 첫 1,000개 하네스 = $20~80 → MVP에 부담 없음
- 캐싱: 동일 slug에 재생성 금지 (덮어쓰기 옵션 별도)

### 실패 처리
- 생성 실패 시 `thumbnail_url = null` → emoji fallback 자동 작동
- 큐에 재시도 1회만 (Phase 2 재시도 정책은 별도 설계)

### 구현 위치 (Phase 2)
- `apps/web/src/lib/character-gen/`
  - `index.ts` — `generateCharacter(harnessId)` 진입점
  - `prompts.ts` — 위 4종 템플릿 + 동적 주입 로직
  - `gemini.ts` — Imagen API 클라이언트
  - `storage.ts` — Supabase Storage 업로드 헬퍼
- 호출 지점: `apps/web/src/app/api/harnesses/route.ts` POST 핸들러 마지막
- 트리거 방식: `setImmediate()` (Vercel) 또는 큐(BullMQ — Phase 3)

---

## ✅ 체크리스트 (Phase 1 즉시 적용)

- [ ] 프롬프트 4개 각각 Grok 또는 Gemini에 붙여넣기
- [ ] 결과 PNG 4장을 정확한 파일명으로 저장
- [ ] `apps/web/public/characters/` 에 배치
- [ ] 브라우저 새로고침 → 갤러리 카드 4개에 캐릭터 이미지 표시 확인
- [ ] 상세 페이지(`/harnesses/{slug}`) 결과 섬네일도 동일하게 표시 확인

---

## 변경 이력
- 2026-04-25: 초기 작성. Phase 1 수동 + Phase 2 자동 설계.
