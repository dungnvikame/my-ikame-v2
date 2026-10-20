---
phase: 4
title: "Build + Verify"
status: pending
priority: P1
effort: "1h"
dependencies: [1, 2, 3]
---

# Phase 4: Build + Verify

## Overview
Chốt chất lượng: typecheck/build, kiểm tra hành vi trên dev server (preview pane), responsive, console sạch.

## Requirements
- `npm run build` (tsc + vite) exit 0; không console error trên các route MVP.

## Implementation Steps
1. `npm --prefix prototype-app run build`.
2. Preview (port 5180): duyệt /home, /feed (4 tab, đăng bài, mở article, acknowledge), /events, /apps (search, SSO flow, launcher), /assistant.
3. Kiểm tra 3 redirect (/news, /community, /news/:id).
4. `read_console_messages` sạch lỗi; resize mobile (375px) kiểm tra feed + apps + bottom nav.
5. Screenshot bằng chứng các màn chính.

## Success Criteria
- [x] Build sạch; console không error
- [x] Toàn bộ Success Criteria của plan.md tick xong
- [x] Mobile OK (không tràn ngang)

## Risk Assessment
- Lazy chunk đổi tên route gây treo Suspense → kiểm tra điều hướng tiến/lùi giữa /feed và article.
