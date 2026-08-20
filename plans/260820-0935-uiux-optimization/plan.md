# Kế hoạch tối ưu UI/UX toàn sản phẩm My iKame

- **Ngày**: 20/08/2026 · **Branch**: master · **Trạng thái**: ✅ HOÀN TẤT cả 6 phase (20/08/2026)
- **Kết quả nghiệm thu**: 13/13 route sạch tràn ngang @375px; Inter Variable loaded; 1 engine AI duy nhất; 1 hệ card sự kiện; 1 toast toàn cục; tabs điều hướng bàn phím; build tách 20 chunk/route; 0 lỗi console
- **Ngoài kế hoạch phát hiện thêm khi verify**: root cause tràn mobile không phải bottom-nav mà là min-content overflow (priority-hero h2 nowrap, community tabs không wrap, assistant-welcome shrink-to-fit) — đã fix tận gốc bằng min-width:0/width:100%
- **Bỏ qua có chủ đích**: virtualize list (mock data < 50 items — ghi nhận cho tương lai)
- **Phạm vi**: toàn bộ prototype-app (iKamer + Manager), không đổi kiến trúc dữ liệu
- **Phương pháp**: audit source + runtime (viewport 375px, dark mode, đo touch-target/font thực tế) đối chiếu database design-intelligence (99 UX guidelines, product patterns) và best practice sản phẩm thế giới

## Nghiên cứu & chuẩn đối chiếu

| Nguồn | Pattern áp dụng |
|---|---|
| DB skill: Productivity Tool | Flat + micro-interactions; functional colors; "ease of use, speed & efficiency" |
| DB skill: AI-Native UI | Streaming text, minimal chrome, context awareness (Trợ lý AI đã đúng hướng) |
| ServiceNow Otto / Employee Center | AI front door + workspace split (đã áp dụng) — chuẩn để giữ nhất quán |
| Lattice / 15Five | 360 profile, signal cards, AI insight (đã áp dụng trang Đội ngũ) |
| Linear / Notion | Keyboard-first (⌘K có rồi), focus states rõ, motion 150–300ms có chủ đích, stagger list |
| Material / Apple HIG | Touch ≥44pt, input ≥16px mobile, roving tabindex cho tabs, reduced-motion |

## Findings từ audit (bằng chứng đo thực tế)

### 🔴 P1 — Mobile & Accessibility (CRITICAL)
| # | Vấn đề | Bằng chứng | Hướng fix |
|---|---|---|---|
| 1 | Bottom-nav tràn viewport mobile → mọi trang bị giãn ngang | `.bottom-nav` 414–418px trên viewport 375 (5 item × 84px); `/home` iw=414, `/community` iw=418 | Grid 5 cột `1fr` + `min-width:0`, label rút gọn/ellipsis, padding co theo breakpoint |
| 2 | Input font-size 14px → iOS auto-zoom khi focus | composer textarea `fs:14px`; body mobile 14px | Mọi input/textarea ≥16px ở ≤620px; cân nhắc body mobile 15–16px |
| 3 | Touch target dưới 44px | Post action 50×34; topic-chip ~30px cao | `min-height:44px` cho mọi control tương tác ở mobile (hoặc mở rộng hit-area) |
| 4 | Tabs có `role=tab` nhưng không điều hướng được bằng phím mũi tên | Tất cả tab groups (events, goals, member 360, feed filter, notifications) | Roving tabindex + ArrowLeft/Right theo WAI-ARIA APG — làm 1 component `Tabs` dùng chung |
| 5 | Handoff overlay: không focus-trap, không đóng bằng Esc | `PlatformHandoff.tsx` — overlay chỉ có nút quay về | Thêm Esc, focus-trap, focus trả về trigger (theo pattern NotificationsDrawer có sẵn) |
| 6 | Focus-visible phủ không đều | 20 occurrences/6 file — thiếu nav-item, member-card, quick-action, chips | Sweep: quy tắc focus ring toàn cục cho `a, button, [tabindex]` qua token |
| 7 | Không scroll-to-top khi đổi route | Không có `ScrollRestoration`/scrollTo trong src | Component `ScrollToTop` on route change + giữ scroll khi Back (state preservation) |

### 🟠 P2 — Typography & Brand
| # | Vấn đề | Bằng chứng | Hướng fix |
|---|---|---|---|
| 8 | Font Inter khai báo nhưng KHÔNG được load — đang render Segoe UI fallback | `document.fonts` → interLoaded:false; không có link/@font-face nào | Self-host Inter (woff2, @fontsource) + `font-display:swap`, preload weight 400/600; hoặc quyết định chính thức dùng system stack |
| 9 | Emoji làm icon cấu trúc ở vài chỗ | Widget-head Feed (🎂📅🏆🎖️), steps chips AI (🔴🟡📋 trong workspace fields) | Quy ước: emoji CHỈ cho cover/celebration (decorative); vị trí cấu trúc → Phosphor icon |

### 🟡 P3 — Consistency (một hệ ngôn ngữ)
| # | Vấn đề | Bằng chứng | Hướng fix |
|---|---|---|---|
| 10 | HAI surface AI song song gây lẫn lộn: AskIKamePanel (chip-only, engine kịch bản cũ) vs AssistantPage (engine mới, form/editor/OKR) | Topbar Sparkle mở panel cũ; sidebar mở trang mới; 2 engine khác nhau | Hợp nhất: Sparkle mở panel mini dùng CHUNG `agent-replies` + nút "Mở toàn màn hình" → /assistant?tiếp tục phiên; loại bỏ dần ai-scripts v1/v2 panel |
| 11 | 2 ngôn ngữ card sự kiện: EventCard cũ (home rail) ≠ EventCardV2 | `ContentCards.EventCard` vs `events/EventCardV2` | Home rail dùng EventCardV2 compact; xóa EventCard cũ |
| 12 | GoalDetailPage sơ sài + còn nút chết "Cấu hình trong iGoal" | `GoalPages.tsx:39` Button title="Demo" | Thay PlatformHandoffButton; nâng layout theo chuẩn member-360 (progress hero + KR list + reports) |
| 13 | 3 hệ toast khác nhau | community-toast, handoff-toast, receipt inline | 1 ToastProvider toàn cục (role=status, auto-dismiss 3–5s, action optional) |
| 14 | EmptyState dùng chung icon CheckCircle mọi ngữ cảnh | `UI.tsx` EmptyState | Prop `icon` theo ngữ cảnh (search → kính lúp, feed → chat...) |

### 🟢 P4 — Delight & perceived quality
| # | Đề xuất | Chuẩn |
|---|---|---|
| 15 | Stagger entrance cho list/grid (feed, roster, requests, news): 30–50ms/item, translateY 4–8px + fade, chỉ transform/opacity | MD stagger + reduced-motion guard |
| 16 | Press feedback: scale 0.97–0.98 cho card/button chính | HIG scale-feedback 150ms ease-out |
| 17 | Page-level transition nhẹ (fade 120ms) giữa route | continuity, exit nhanh hơn enter |
| 18 | Notification item: icon theo priority (critical/required/info) thay dot đơn sắc | color-not-only |

### 🔵 P5 — Search & IA
| # | Vấn đề | Hướng fix |
|---|---|---|
| 19 | SearchPage chỉ tìm news + events — thiếu người, tri thức, feed posts, requests | Thêm section Người (danh bạ), Tài liệu iWiki, Bài Feed; đồng bộ nguồn với SearchPalette |
| 20 | "Tìm gần đây" mất khi rời trang (state local) | localStorage, clear theo resetDemo |

### ⚪ P6 — Performance & hygiene (thấp — data local)
| # | Đề xuất |
|---|---|
| 21 | Route-level code splitting (`React.lazy` + Suspense cho pages) khi bundle lớn dần |
| 22 | Favicon: xuất 32/180/512 từ logo; preload logo sidebar |
| 23 | Virtualize feed/list nếu mock data vượt ~50 items (chưa cần bây giờ) |

## Phases thực thi

### Phase 1 — Mobile & A11y foundation (fix #1–7) — ưu tiên cao nhất
- Files: `app.css` (bottom-nav, focus tokens, input mobile), `components/Tabs.tsx` (mới, thay 5 chỗ tablist), `PlatformHandoff.tsx`, `App.tsx` (ScrollToTop)
- Acceptance: 375px không trang nào scrollWidth > innerWidth; mọi input ≥16px mobile; tab điều hướng được bằng phím; handoff đóng bằng Esc; route change scroll top
- Ước lượng: 0.5–1 ngày

### Phase 2 — Typography & brand (fix #8–9)
- Self-host Inter woff2 400/500/600 + swap; quét emoji cấu trúc → Phosphor
- Acceptance: `document.fonts` Inter loaded=true; không đổi CLS (fallback metric-compatible)

### Phase 3 — Consistency (fix #10–14)
- Hợp nhất AI surface (lớn nhất — panel mini tái dùng agent-replies, migrate chips hữu ích từ ai-scripts sang intents), EventCardV2 everywhere, GoalDetail nâng cấp, ToastProvider, EmptyState icon prop
- Acceptance: 1 engine AI duy nhất; 1 kiểu card sự kiện; 1 toast system; không còn nút chết

### Phase 4 — Delight (fix #15–18)
- Stagger + press feedback + route fade + notification icons; tất cả sau `prefers-reduced-motion` guard
- Acceptance: animation 150–300ms, chỉ transform/opacity, tắt được bằng reduced-motion

### Phase 5 — Search & IA (fix #19–20)
### Phase 6 — Perf & hygiene (fix #21–23, làm nền khi rảnh)

## Checklist nghiệm thu cuối (theo pre-delivery checklist của skill)
- [ ] 375px + landscape: không h-scroll, bottom-nav vừa khít
- [ ] Mọi touch target ≥44px mobile; input ≥16px
- [ ] Tab/drawer/overlay: keyboard đầy đủ, focus trả về trigger
- [ ] Dark mode: contrast text ≥4.5:1, states phân biệt được cả 2 theme
- [ ] Reduced-motion: mọi animation tắt/giảm
- [ ] 1 engine AI, 1 hệ card, 1 hệ toast, 0 nút chết
- [ ] Typecheck + verify từng trang trên preview

## Câu hỏi chưa chốt
1. Hợp nhất AI: giữ panel mini (Sparkle) làm "quick ask" hay bỏ hẳn, Sparkle điều hướng /assistant? (khuyến nghị: giữ mini panel dùng chung engine)
2. Font: đầu tư self-host Inter hay chính thức hóa system stack (Segoe/SF)? (khuyến nghị: self-host Inter — brand nhất quán cross-platform)
3. Emoji covers (news/events) giữ làm ngôn ngữ thương hiệu demo hay thay minh họa SVG? (khuyến nghị: giữ)
