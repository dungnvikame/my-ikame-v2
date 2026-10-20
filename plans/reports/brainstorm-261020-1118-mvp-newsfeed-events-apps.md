# Brainstorm — MVP My iKame: Newsfeed + Sự kiện + App Directory

**Date:** 2026-10-20 | **Status:** accepted (user confirmed 4/4 decisions) | **Next:** ak:plan → ak:cook

## Contract

### Outcome
MVP My iKame (prototype React/Vite, mock data) tập trung 2 module chính + 1 hub phụ trợ:
1. **Newsfeed** — gộp `Tin tức` (/news) + `iKame Feed` (/community) thành MỘT feed duy nhất: kênh truyền thông chính thức thay Facebook & Slack. Thông báo chính thức (official/pinned/mandatory + acknowledge) + bài social + bài theo team, lọc bằng tab/filter audience. Composer, reaction, comment, save, mention giữ từ Community.
2. **Sự kiện** — tổng hợp đã/đang/sắp diễn ra (module hiện tại đã mạnh: hero, stats, timeline, RSVP, ICS — nâng cấp/tinh chỉnh theo MVP, không đập lại).
3. **Ứng dụng (App Directory)** — trang riêng trong sidebar: tìm kiếm, phân loại, mô tả, SSO deep-link (tái dùng `PlatformHandoff`); + launcher nhanh trên topbar kiểu Google apps grid. Apps: iGoal, iWiki, iHRM, iHiring, iRefer, iRequest…
4. **Trợ lý AI giữ nguyên** (AssistantPage, QuickAskPanel, search answers).

### Constraints
- Prototype frontend-only, mock data trong AppState — không backend.
- Navigation tinh gọn: chỉ Trang chủ, Newsfeed, Sự kiện, Ứng dụng, Trợ lý AI. Module khác (Tri thức, Mục tiêu, iRequest page, Manager views) ẨN khỏi nav — code giữ nguyên, không xoá.
- Không thay chat 1-1/realtime của Slack — chỉ thay vai trò kênh truyền thông chính thức. Không có khái niệm channel join/leave.
- Giữ design system hiện có (tokens, UI.tsx, Tabs, toast), WCAG, reduced-motion, responsive.
- Spec D6 (docs/My-iKame-Product-Spec-v0.2.md): H2 scope = Newsfeed + Event — MVP này khớp spec.

### Non-goals
- Channel/group kiểu Slack; chat realtime; DM.
- Backend, API, auth thật; marketplace app/extension.
- ML ranking (D5: rule-based minh bạch); build lại module Events từ đầu.
- Xoá code các module ngoài MVP.

### Acceptance criteria
- Nav sidebar (cả mobile tabbar) chỉ còn 5 mục MVP; route cũ /news, /community redirect về /feed.
- /feed: 1 trang gộp — tab Toàn công ty / Team / Thông báo chính thức / Đã lưu; bài official có acknowledge + hạn; pinned carousel; composer hoạt động; bài từ mock News hiển thị dạng article card trong feed, mở detail đọc đủ.
- /events giữ đủ: tabs đã/đang/sắp, RSVP, ICS, detail.
- /apps: grid app nội bộ có search + category, click → PlatformHandoff SSO flow; topbar có launcher grid mở nhanh.
- /assistant hoạt động như hiện tại, không regress.
- Build sạch (`npm run build`), không lỗi console, responsive mobile.

## Options considered
| Quyết định | Chọn | Loại |
|---|---|---|
| Feed: gộp News+Community vs giữ 2 module | **Gộp 1 Newsfeed** | user confirmed |
| Nav: tinh gọn vs giữ nguyên | **Tinh gọn, ẩn ngoài-MVP** | user confirmed |
| App directory: trang riêng+launcher vs section Home | **Trang riêng + topbar launcher** | user confirmed |
| Thay Slack: feed+filter vs channel | **Feed + audience filter** | user confirmed |

Rủi ro chính của phương án gộp feed: 2 data model (`NewsPost` vs `Post`) phải quy về 1 card contract — giải quyết bằng discriminated union/adapter, không merge type vội.

## Research synthesis (agent-platform internal portals)
- **Glean**: search/knowledge layer + assistant personalization; assistant sống trong surface có sẵn. Học: AI là lớp trên của search, permission-aware (khớp D8, D9).
- **Moveworks/ServiceNow** (acquisition 2025, "Autonomous Workforce"): agent nhận request → chạy workflow hệ thống domain → trả kết quả. Học: My iKame = entry point, hành động thật qua deep-link/adapter (khớp D1, D7).
- **Meta Workplace shutdown (data xoá 6/2026)** → doanh nghiệp dồn về Workvivo/Viva Engage: khoảng trống "Facebook nội bộ" là thật; pattern Workvivo: official news + social + events trong 1 feed — đúng hướng gộp.
- **Viva Connections**: dashboard card + resources + news — mẫu cho app directory card contract.
- **Agentic UX 2026**: show plan trước khi act, approval, activity log, escalation; generative UI card trong assistant. Giữ assistant hiện tại, các pattern này để iteration sau.
- Nguồn: metavert.io, read.ai, techradar.com, mimecast.com, uctoday.com, oak.com, aufaitux.com, towardsai.net.

## Recommendation
Smallest approach thỏa contract: **tái cấu trúc IA + gộp feed bằng adapter, tái dùng tối đa component hiện có** (PostCard, PinnedCarousel, PostComposer, Event*, PlatformHandoff, Assistant*). Xây mới duy nhất: FeedPage hợp nhất + AppsPage + topbar launcher + nav trim.

## Unresolved questions
- Tên hiển thị module gộp: giữ "iKame Feed" hay đổi "Bảng tin"? (mặc định đề xuất: giữ "iKame Feed")
- Trang chủ có cần gọt lại section trỏ tới module đã ẩn (Tri thức, Mục tiêu) không? (mặc định: có, thay bằng shortcut Feed/Sự kiện/Ứng dụng)
