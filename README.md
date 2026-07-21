# INFO IT — IT 지식 정리 기술 블로그

TypeScript + React + Vite + **SSG(정적 사이트 생성)** 기반의 기술 블로그.
Google AdSense 승인과 SEO를 목표로, [사전조사 리서치](블로그_사전조사_리서치.md) 결과를 반영해 설계했습니다.

## 스택

- **Vite** — 빌드 도구 (CRA 대체)
- **React 18 + TypeScript**
- **커스텀 SSG 프리렌더** — Vite SSR 빌드(`entry-server`) + `renderToString`으로 각 경로를 정적 HTML로 생성(`prerender.mjs`). 크롤러/애드센스가 완성된 HTML을 받음
- **react-router-dom** — 라우팅 (client: `BrowserRouter`, prerender: `StaticRouter`)
- **MDX** — 마크다운 기반 글 작성
- **Shiki** — 빌드 타임 코드 하이라이팅(듀얼 테마)
- **자체 head 수집기**(`src/lib/head.tsx`) — 외부 의존성 없이 페이지별 메타/OG/canonical/JSON-LD 주입 (SSR은 Context 수집, CSR은 `document` 갱신)

> ℹ️ 처음엔 `vite-react-ssg`를 시도했으나 현재 Node 24 환경에서 렌더 단계가 네이티브 크래시(0xC0000409)를 일으켜, 동일 목적의 커스텀 프리렌더로 교체했습니다.

## 시작하기

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 정적 빌드 + sitemap 생성 → dist/
npm run preview  # 빌드 결과 미리보기
npm run typecheck
```

## 글 작성

`src/content/posts/` 에 `.mdx` 파일을 추가하면 자동으로 목록·라우트·사이트맵에 반영됩니다.

```mdx
---
title: 글 제목
date: 2026-07-22
description: 검색·SNS 미리보기에 쓰이는 요약 (150자 내외)
category: 프론트엔드
tags: [React, SEO]
---

본문을 마크다운으로 작성합니다.
```

## 구현된 기능 (리서치 반영)

| 영역 | 내용 |
|------|------|
| UI/UX | 다크모드(토큰 기반·FOUC 방지), 66ch 본문, 벤토 그리드, 읽기 진행바, 스티키 목차, 절제된 모션 |
| 접근성 | WCAG 2.2 대비, `:focus-visible` 포커스 링, 스킵 링크, `prefers-reduced-motion`, 44px 타깃 |
| SEO | 페이지별 메타/OG/Twitter, canonical, `BlogPosting`/`WebSite` JSON-LD, sitemap.xml, robots.txt |
| 애드센스 | 필수 페이지(개인정보처리방침·소개·문의·이용약관), `AdUnit` 컴포넌트(중복 push 방지), ads.txt |

## 배포 전 체크리스트

1. `src/site.config.ts` — `siteUrl`, 저자 정보, `adsense.client` 를 실제 값으로 교체
2. `scripts/generate-sitemap.mjs`, `public/robots.txt` 의 `example.com` → 실제 도메인
3. 애드센스 승인 후:
   - `index.html` 의 adsbygoogle 스크립트 주석 해제
   - `src/site.config.ts` 의 `adsense.enabled = true`
   - `public/ads.txt` 에 퍼블리셔 ID 입력
4. `src/pages/Privacy.tsx` 개인정보처리방침을 실제 수집 실태에 맞게 검토
5. 깊이 있는 글 15개 이상 확보 후 애드센스 신청 (사전조사 리서치의 Go/No-Go 체크리스트 참고)

## 빌드가 간헐적으로 실패할 때 (Windows/OneDrive)

이 프로젝트는 OneDrive 동기화 폴더(`바탕 화면`) 아래에 있습니다. 빌드 중 파일 동기화가 겹치면
드물게 네이티브 크래시(exit `-1073740791`)가 날 수 있습니다. 해결:

- 실패 시 해당 빌드 단계를 **다시 실행**하면 대개 성공합니다 (`npm run build:client`, `build:server` 개별 실행).
- 근본 해결: 프로젝트를 OneDrive 밖 경로(예: `C:\dev\INFO_IT`)로 옮기면 안정적입니다.
- 빌드 중에는 OneDrive를 일시 중지하는 것도 도움이 됩니다.

## 정적 호스팅 SPA fallback

라우팅이 History API 기반이므로, 정적 호스팅 시 SPA fallback 설정이 필요합니다.
(vite-react-ssg 는 각 경로를 정적 HTML 로 프리렌더하므로 대부분 그대로 동작하며,
Netlify/Vercel/Cloudflare Pages 에 `dist/` 를 배포하면 됩니다.)
