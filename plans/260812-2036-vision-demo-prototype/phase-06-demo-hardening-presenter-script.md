# Phase 6 — Demo Hardening: Badges Sweep, Reset, Presenter Script, Rehearsal

## Context Links

- [plan.md](./plan.md) — sequential last, after phases 2-5 all land
- [Brainstorm summary](../reports/brainstorm-260812-2036-vision-demo-prototype.md) §4 (tour table = presenter script skeleton) + §6 (risks/mitigations incl. prepared answers)
- [Research report](../reports/researcher-260812-2036-ai-ex-platform-trends.md) (talking-point stats + sources)
- Existing: `prototype-app/scripts/visual-check.mjs`, `pages/ProfilePage.tsx`, Vercel auto-deploy from `master`

## Overview

- **Priority:** P1 — gates the demo. **Effort:** 2d (RED TEAM F9 — bumped from 1.5d), trong đó **0.5d rehearsal là BẤT KHẢ XÂM PHẠM**: không được trừ vào để fix defect; defect lớn hơn quỹ còn lại → escalate, không lặng lẽ cắt rehearsal.
- Cross-cutting polish + the two artifacts that make the demo repeatable under pressure: a **reset affordance** and the **presenter script** (verify/time/expand Phase 1's skeleton — NOT written from scratch here, per F8). Ends with full golden-path rehearsal **on the deployed build**.

## Key Insights

- The R0 hardening lesson: parallel phases each ship small gaps — log-then-fix, absorb here, escalate anything structural.
- **Reset is a demo-critical feature**, not a dev tool: mid-demo mistakes (acknowledged the article too early, resolved the wrong item) must be recoverable in <5s without refresh-and-lose-theme.
- The presenter script is written AGAINST the built product (click paths verified), not from memory — every "money moment" line rehearsed with a timer.
- Badge-consistency sweep: concept surfaces (Ask panel, AI-brief, Knowledge, Goals, vision roadmap concept rows) ALL carry `RBadge`; shipped R1 screens carry none (badge = exception marker, not wallpaper).

## Requirements

### Functional
- **Reset:** button "Đặt lại dữ liệu demo" in `ProfilePage` (Phiên đăng nhập block hoặc block riêng "Demo") → `resetDemo()` + receipt. Verify it restores: news ack/read, event registrations (incl. S4's AI RSVP), notifications read-state, attention resolved items, goal check-ins, Ask conversation.
- **Badges sweep:** audit all routes — concept surfaces badged, R1 surfaces clean, no double badges.
- **visual-check.mjs additions (RED TEAM F10 — static routes ONLY):** screenshots `vision-desktop`, `knowledge-desktop`, `goals-desktop`. KHÔNG automate panel interactions (focus trap + stagger timers = flaky, không có CI chạy lại trước demo — rehearsal chính là bài test). Giữ các check hiện có xanh.
- **Presenter script** `docs/demo-presenter-script-bld.md` (tiếng Việt) — verify/time/expand Phase 1's skeleton:
  - Bảng 7 trạm: thời lượng ĐO THẬT khi rehearse · click path click-verified · money moment · talking point (1-2 câu) · quyết định D# liên quan · số liệu (nếu có) · fallback nếu lỗi.
  - **(F3)** Luật event: `ai-product-workshop` CHỈ AI đụng (S4); beat RSVP thật dùng `global-webinar-us` + `design-sprint-full` (waitlist).
  - **(A3 two-step)** Trạm 5 choreography: AI gửi + biên lai ("item vẫn ở queue") → Mai narrate human-in-the-loop → bấm "Đã xử lý" — HAI bước có chủ đích, kể như tính năng.
  - **(F13)** Luật reset: "Đặt lại dữ liệu demo" CHỈ dùng giữa các lượt chạy; lỗi giữa chừng → kể chuyện tiếp, không reset (reset xoá bằng chứng các trạm trước — workshop AI vừa đăng ký sẽ biến mất).
  - Express path (~15'): bỏ trạm 4, gộp News+Events.
  - Prepared answers: "AI này thật chưa?" · "Sao không mua Viva/ServiceNow?" · "Bao giờ có thật?" (map sang ladder + foundation §41.11) · partnership stance (MIT 2x).
  - Logistics: **URL deployment đã pin** (bản đã rehearse) + chạy local (`npm run dev`) làm fallback; reset flow; dark/light chọn trước; ghi chú độ phân giải/zoom phòng họp.
- **QA pass on new surfaces:** dark mode + 390px + **(F14) băng ~1024px và zoom 125%** (dải máy chiếu/screen-share thực tế — breakpoint sidebar/drawer chuyển ở đây và chưa ai test) cho Ask panel, Knowledge, Goals, ManagerPage mới, VisionPage; keyboard: Esc/trap trên Ask panel; `aria-label` các icon-button mới.
- Final gates: `npm run typecheck && npm run build && npm run visual:check` xanh; **(F14) thứ tự bắt buộc: push cuối → verify Vercel → REHEARSE ×2 trên đúng URL đã deploy → đóng băng (không push nữa tới sau demo)**; bấm giờ ≤ 30'.

### Non-functional
- Presenter script ≤150 dòng, in được 2 trang. Không thêm dependency.

## Related Code Files

**Modify (owned):** `src/pages/ProfilePage.tsx` (reset button), `prototype-app/scripts/visual-check.mjs`, targeted badge/a11y fixes anywhere (sequential — safe)
**Create:** `docs/demo-presenter-script-bld.md`
**Read-only:** everything else unless a logged defect requires a surgical fix (≤20 lines; bigger → follow-up note)

## Implementation Steps

1. Confirm phases 2-5 landed, build green; `git log` clean per-phase commits.
2. Wire reset button + verify full state-restore checklist (each AppState slice; theme/perspective KHÔNG reset — F13).
3. Badge sweep all routes (log → fix).
4. Dark/mobile/keyboard + 1024px/125%-zoom QA on new surfaces (log → fix; structural issues become follow-up notes).
5. Extend `visual-check.mjs` (3 static screenshots); run until green.
6. Update presenter script from Phase-1 skeleton against the real build (click-verify từng path; thêm prepared answers + logistics).
7. **Final commit + push → verify Vercel serves new routes.**
8. **Rehearsal ×2 trên URL đã deploy** (+1 lượt local fallback check) với timer; ghi timing thật vào script; chỉnh express-path notes.
9. Đóng băng: không push nữa tới sau demo (hoặc pin deployment URL vào script nếu buộc phải push).

## Todo List

- [ ] Reset button restores every mutable slice trừ theme/perspective (checklist per AppState useState)
- [ ] Badge sweep: concept badged, R1 clean
- [ ] Dark + 390px + 1024px/125%-zoom + keyboard pass on 5 new/changed surfaces
- [ ] visual-check.mjs: 3 screenshot tĩnh mới + xanh ổn định (không automate panel)
- [ ] Presenter script: 7 trạm timing thật + luật event/reset/A3-two-step + express path + 4 prepared answers + logistics (pinned URL)
- [ ] Push → verify → rehearsal ×2 trên bản deploy → freeze
- [ ] typecheck && build && visual:check xanh

## Success Criteria

- Một người chưa từng thấy repo có thể chạy demo chỉ bằng presenter script.
- Reset giữa chừng đưa app về trạng thái mở màn trong <5s, không refresh.
- Golden path chạy 2 lần liên tiếp không lỗi trên cả hai môi trường.

## Risk Assessment

- **Defect pile-up từ 4 phases song song** → log-then-fix; structural → follow-up, không scope-creep.
- **visual-check flaky với panel animation** → chờ selector ổn định, không sleep cứng.
- **Rehearsal phát hiện demo >30'** → express path đã chuẩn bị; cắt trạm 4 trước, trạm 3 sau.

## Security Considerations

- Presenter script không chứa thông tin nhạy cảm nội bộ (chỉ đường dẫn demo + số liệu public).
- Screenshot set kiểm tra lần cuối: toàn fictional data.

## Next Steps

- Sau demo: thu feedback BLĐ → quyết định scope H2 mở rộng → plan mới. Follow-up kỹ thuật treo lại: UI-kit migration (khi có VPN/GitLab token), Playwright suite đầy đủ, real AI foundation (A0-A2 theo §41.11).
