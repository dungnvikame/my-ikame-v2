# Phase 5 — `/vision` Screen (North Star, Ladder, Roadmap, Market Stats)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-types-state-stubs.md) (route + stub + sidebar link landed)
- Content sources: spec §1.1/§1.2 (product statement, one-line test), §2 (problem/outcome), §54 (WUAR + metric tree), §23.1 (A0-A4 ladder), §7.1 (R1-R5 scope map) · [market stats + sources](../reports/researcher-260812-2036-ai-ex-platform-trends.md) "Ammunition" section
- Design language: Core DS 1.1 tokens (`core-ds-1.1.css`), existing `.page`/`.eyebrow`/`.metric-card` patterns

## Overview

- **Priority:** P1 — opens AND closes the demo (stops 0 và 6); the screen answering "tại sao phải làm như vậy". **Effort:** 1.5d (RED TEAM F12 — bumped from 1d) **with a mandatory mid-phase checkpoint: layout + draft copy done → product owner reviews ALL Vietnamese copy → revise**. Exec-grade VN copy is the artifact AI agents judge worst and the owner must personally approve; it must NOT be read for the first time the night before rehearsal. Parallel with 2/3/4.
- One long scrollable page, presenter-friendly (large type, one idea per viewport), with anchors `#intro` (mở màn) and `#ladder` (đóng màn).

## Key Insights

- This is a **stage backdrop, not a dashboard**: bolder typographic scale than app pages is intentional, but stays on Core DS tokens (no new colors). It must also survive BLĐ self-browsing after the demo — every claim carries its source inline (footnote style), consistent with the product's own "explainable" principle.
- The A0→A4 ladder section **imports the shared `AiBadge` from Phase 1's `components/AiBadge.tsx`** (RED TEAM F1 — now a frozen contract, legal to import) so the pills are pixel-identical to the Ask panel's — the "thu hoạch" moment (đóng màn: "các badge anh chị vừa thấy nằm ở đây trên thang trưởng thành").
- Section order = narrative order: problem → thesis (gate) → North Star → ladder ("chúng ta demo tới đây, hàng thật tới đây") → roadmap R1→R5 với marker "chúng ta ở đây" → market proof (3-4 stats) → benchmark strip → closing statement.
- Marker honesty: R1 = "đang chạy (prototype hàng thật)"; R2/R3 = "concept đã demo"; R4/R5 = "concept scripted". Never imply more.

## Requirements

### Functional (sections, top → bottom)
1. **Hero `#intro`**: eyebrow "TẦM NHÌN SẢN PHẨM" + product statement (§1.1) + one-line test as sub-quote.
2. **Problem → Outcome**: two-column before/after (hiện trạng 5 gạch đầu dòng §2.1 rút còn 3 → outcome §2.2 rút còn 3); mobile stacks.
3. **Gate thesis**: 1 visual row — "Gate, không phải super-app" (D1): summary + CTA + deep-link pattern diagram (3 simple boxes: My iKame → domain tools, thuần CSS).
4. **North Star**: WUAR formula block (monospace fraction như spec §54.1) + allow-list "useful actions" chips + 1 câu "đo hành động hoàn thành, không đo page view".
5. **AI maturity ladder `#ladder`**: 5 rows A0→A4, mỗi row: `AiBadge`-style pill + capability + điều kiện (§23.1) + status tag (A0-A1 "demo hàng thật/scripted", A2-A4 "concept — cần foundation"); D9 một câu đóng: "Không build chatbot trước khi có nền — đó là lý do 95% pilot chết còn chúng ta thì không".
6. **Roadmap R1→R5**: horizontal timeline (vertical on mobile) từ §7.1 scope map, marker "CHÚNG TA Ở ĐÂY" giữa R0-hoàn-thành và R1.
7. **Market proof**: 4 stat cards với footnote nguồn: Gartner 40% enterprise apps có agent cuối 2026 · MIT 95% pilot fail / 5% "design for friction" · ServiceNow 91% case resolution · FPT 1.000 agents / 84K nhân viên. Mỗi card 1 dòng "nghĩa là gì với chúng ta".
8. **Benchmark strip**: text row các pattern đã học (Viva Connections, ServiceNow EC, Workday, Staffbase, Glean) — "học pattern, không mua nguyên khối" (một câu trả lời sẵn cho "sao không mua?").
9. **Closing**: product statement lặp lại + "Quyết định hôm nay: chốt tầm nhìn để mở scope H2".

### Non-functional
- Presenter-readable ở khoảng cách phòng họp: base font section titles ≥ 28px desktop. Dark mode đầy đủ (demo có thể chạy dark). 390px stack sạch. File ≤200 lines → tách data ra `const SECTIONS`-style local arrays; styles trong `styles/vision.css`.

## Architecture

- Pure static page — zero AppState reads ngoài theme (inherits). All copy as local consts (Vietnamese), stats array `{ number, label, meaning, source, href }`.
- Anchors via `id` + sidebar link lands `#intro`; presenter dùng End-key/scroll xuống `#ladder` khi đóng màn (ghi trong presenter script).
- Timeline/ladder: CSS grid, no library.

## Related Code Files

**Modify (owned):** `src/pages/VisionPage.tsx` (fill stub), `src/styles/vision.css` (fill)
**Read-only (frozen):** `App.tsx`, `AppShell.tsx`, `components/RBadge.tsx`, spec + research reports (content source)

## Implementation Steps

1. Draft all Vietnamese copy as consts first (from spec + research bullets) — content trước, layout sau.
2. Build sections 1-9 với anchors; grid layouts; stat cards; ladder imports shared `AiBadge`.
3. **CHECKPOINT (F12): gửi toàn bộ copy cho product owner duyệt** — layout có thể tiếp tục song song; copy revision theo feedback trước khi phase được tính là done.
4. Fill `vision.css` (type scale, two-column, ladder rows, timeline, stat cards) — light + dark.
5. Mobile stack pass; verify sidebar link + `#ladder` anchor scroll.
6. `npm run typecheck && npm run build`.

## Todo List

- [ ] 9 sections đúng thứ tự narrative, anchors #intro/#ladder
- [ ] WUAR formula + useful-action chips
- [ ] Ladder A0→A4 với status honesty tags, dùng chung visual với AiBadge
- [ ] Roadmap + marker "chúng ta ở đây"
- [ ] 4 stat cards có nguồn + "nghĩa là gì với chúng ta"
- [ ] Benchmark strip + câu "học pattern, không mua nguyên khối"
- [ ] Dark + 390px; typecheck && build green

## Success Criteria

- Đứng một mình tự kể chuyện được (BLĐ tự browse sau demo hiểu không cần người dẫn).
- Không có claim nào thiếu nguồn; không có status tag nào nói quá hiện trạng.
- Trình chiếu phòng họp đọc được từ xa (kiểm tra ở rehearsal Phase 6).

## Risk Assessment

- **Thành slide-deck-trong-app nhàm** → mỗi section 1 ý, nhiều khoảng trắng, visual ladder/timeline là điểm nhấn; không tường chữ.
- **Số liệu bị thách thức** → nguồn inline + ngày; MIT/Gartner là secondary-sourced (Forbes) — ghi rõ nguồn dẫn.

## Security Considerations

- Static content; không nhúng số liệu nội bộ nhạy cảm (chỉ public market stats + fictional demo data).

## Next Steps

- Phase 6: thêm vào visual-check; presenter script mở màn #intro (2') và đóng màn #ladder (3').
