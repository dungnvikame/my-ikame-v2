---
phase: 5
title: "Verify + review + commit"
status: pending
priority: P1
effort: "1h"
dependencies: [1, 2, 3, 4]
---

# Phase 5: Verify + review + commit

## Overview
Build sạch, chạy kịch bản demo vòng lặp COM↔iKamer trên preview, code-review subagent, commit.

## Implementation Steps
1. `npm --prefix prototype-app run build`.
2. Preview :5180 — kịch bản: iKamer /feed đăng kudos, đăng bài vi phạm → chặn; ack bài chính sách; switch COM Admin → /admin ack tăng, push, nhắc, ghim; /events/town-hall-q2 album + khảo sát; /assistant "Hôm nay tôi cần làm gì?".
3. F4 resetDemo → mọi state mới về ban đầu.
4. Console sạch; mobile 375px cho /admin + composer.
5. code-reviewer subagent → sửa major; commit.

## Success Criteria
- [ ] Toàn bộ Success Criteria plan.md tick
- [ ] Build + review + commit xong
