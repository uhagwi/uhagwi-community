# 기여 가이드

우하귀에 관심 가져주셔서 감사합니다. 주접 환영합니다.

## 빠른 시작

1. 이슈 먼저 — 버그/기능 모두 GitHub Issue로 의도 공유
2. 브랜치 — `feat/<이슈번호>-짧은설명` 또는 `fix/<이슈번호>-...`
3. 커밋 — [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/) 준수
4. PR — main으로 PR, 이슈 번호 링크 필수, CI 녹색 확인 후 리뷰 요청

## 커밋 형식

```
<type>(<scope>): <subject>

<body>

Refs: #<issue>
```

- `type`: feat, fix, refactor, test, docs, chore, perf
- `scope`: web, bot, db, ui, config, ci, docs
- subject: 50자 이내, 명령형, 한국어 또는 영어
- body: 왜(why) 중심, 무엇(what)은 diff가 설명

예:
```
feat(web): 주접 리액션 낙관적 업데이트 적용

useOptimistic으로 즉시 반영 후 실패 시 롤백.
Upstash sliding window와 결합해 악용 방지.

Refs: #42
```

## 로컬 테스트

```bash
pnpm install
pnpm -r typecheck
pnpm -r lint
pnpm -r test
```

## 코드 스타일

- Prettier 자동 적용 (`pnpm format`)
- ESLint `@uhagwi/config/eslint/base.js` 베이스
- 컴포넌트는 Server 기본, `'use client'` 는 필요 최소
- 주석은 한국어, 타입·함수명은 영어

## PR 체크리스트

- [ ] CI 통과 (lint · typecheck · build)
- [ ] 관련 이슈 링크
- [ ] 스크린샷 (UI 변경 시)
- [ ] 테스트 추가 (로직 변경 시)
- [ ] CHANGELOG 업데이트 필요 여부 확인

## 문의

- 기획·디자인: Discord 우하귀 서버 `#제안` 채널
- 기술: GitHub Discussions
