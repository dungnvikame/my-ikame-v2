# Brainstorm — Demo v2: Cộng đồng + AI mọi module + nâng cấp trải nghiệm

**Ngày:** 2026-08-12 · **Trạng thái:** đã chốt với owner (4 quyết định bên dưới) · **Nền:** build trên demo v1 (commits e9670c1..db8cfbf), giữ nguyên style Core DS 1.1 hiện tại.

## Quyết định đã chốt (owner, 2026-08-12)

| # | Câu hỏi | Quyết định |
|---|---|---|
| D1 | Social đặt đâu | **Module riêng "Cộng đồng"** (`/community`) — Home giữ priority-first thesis; Home thêm teaser sang feed |
| D2 | Nhãn concept | **Giữ AiBadge trên câu trả lời AI, BỎ R-badge trên header module.** 1 dòng disclosure duy nhất trong panel Ask iKame |
| D3 | Thứ tự build | **Làm hết một mạch** (parallel như đợt v1, ~5-6 ngày làm việc), owner review một thể rồi liệt kê sửa |
| D4 | AI free-text | **Chips-only trong panel + seeded queries trong search.** Gõ ngoài seed → kết quả search thường + note nhẹ, không bao giờ "đơ" |

**Nguyên tắc QA theo yêu cầu owner:** không test sâu — gate chỉ còn typecheck + build + smoke golden path; bỏ vòng tester/code-review đầy đủ; owner review bản chạy và liệt kê sửa.

## Yêu cầu (8 hạng mục từ owner + ảnh tham khảo)

1. Module mạng xã hội nội bộ (thay group Facebook) — ảnh 1
2. AI Agent scenario cho MỌI trang module
3. Events: timeline overview + trải nghiệm detail tốt hơn — ảnh 2
4. Search: ô giữa topbar, popup ⌘K, Enter mới vào trang; AI answer tổng hợp trong kết quả
5. Tri thức nâng UI/UX theo chuẩn iWiki — ảnh 3
6. Mục tiêu nâng UI/UX + luồng theo iGoal (OKR tree + báo cáo) — ảnh 4
7. Hồ sơ cá nhân đầy đủ thông tin nhân sự
8. Sidebar chia category

## Thiết kế từng hạng mục

### 1. Cộng đồng (`/community`) — module lớn nhất, wow chính
Layout: feed giữa + right rail (theo ảnh 1). **State thật trong AppState** (posts/reactions/comments — resetDemo cover hết):
- **Tin ghim** carousel ngang (3/5, badge Chính thức, tự gỡ khi hết hạn — label tĩnh)
- **Composer hoạt động thật**: gõ → đăng → bài hiện đầu feed (optimistic). Money moment #1
- **PostCard**: tác giả + role, nội dung, ảnh = visual-pattern/emoji cover (KHÔNG ảnh thật — xem Rủi ro), reaction ❤️👏 bấm được (đếm nhảy + micro-animation), bình luận expand + comment composer thật, Chia sẻ/Đã lưu → toast receipt
- **Banner mention**: "Bài viết nhắc tên bạn có 2 bình luận mới" → deep link
- **Right rail**: Hôm nay của tôi (check-in ngay → receipt), Sự kiện (đọc live events state + đếm ngày), Fan iKame tuần (avatar leaderboard), Sinh nhật hôm nay (nút "Chúc" 1 click → chúc xuất hiện dạng comment), Cột mốc thâm niên
- **AI scripts**: "Tuần này có gì hot?" (A2 tổng hợp top post + sinh nhật + sự kiện, citations) · "Soạn lời chúc sinh nhật Vy" (A3 draft → duyệt → **bài chúc đăng thật lên feed**). Money moment #2

### 2. AI mọi module — mở rộng script store (engine giữ nguyên)
| Route | Chip | Level | Hành vi |
|---|---|---|---|
| /community | Tuần này có gì hot? | A2 | Tổng hợp feed-state + citations |
| /community | Soạn lời chúc sinh nhật | A3 | Draft → duyệt → post lên feed |
| /events | Tuần này nên tham gia gì? | A2 | Gợi ý theo lịch + trạng thái đăng ký live |
| /knowledge | Tài liệu cho người mới? | A2 | Curated list + citations (giữ deny Finance) |
| /goals | Soạn báo cáo check-in tuần | A3 | Draft từ goal-state → duyệt → báo cáo vào "Tổng hợp báo cáo" + status flip. Money moment #3 |
| /profile | Tôi còn bao nhiêu ngày phép? | A2 | Đọc mock leave balance |
| Giữ nguyên | S1-S4, fallback, manager S3 | — | Đã chạy tốt ở v1 |

### 3. Events nâng cấp (theo ảnh 2)
- **Hero sự kiện nổi bật**: cover pattern + **countdown sống** (ngày/giờ/phút/giây tick — respect reduced-motion), avatars người tham gia, trạng thái suất
- **Timeline strip 6 tháng**: dot emoji mỗi sự kiện, vạch "HÔM NAY", dòng insight ("Tháng 10 dày nhất với 4 sự kiện"), click dot → cuộn tới sự kiện
- **3 stat cards live**: sự kiện tháng này · bạn sẽ tham gia (đọc registrations) · sắp hết hạn đăng ký
- **Tabs**: Sắp diễn ra / Đang diễn ra / Đã diễn ra / Của tôi; nhóm TUẦN NÀY / SẮP TỚI; card có avatars + thanh capacity (31/60 chỗ)
- **Detail**: hero + countdown + agenda (3-4 mốc chương trình) + participants + sự kiện liên quan; giữ nguyên máy trạng thái RSVP/waitlist/.ics của v1

### 4. Search palette ⌘K + AI answer
- Topbar: ô search **ra giữa**; click hoặc ⌘K → **modal giữa màn hình** (kiểu command palette): input lớn, kết quả tức thì nhóm theo loại (Tin tức/Sự kiện/Tài liệu/Mục tiêu/Người — từ mock data, lọc quyền như cũ), điều hướng bàn phím ↑↓ + Enter
- **AI answer block trên đầu kết quả** (AiBadge A2 + citations) khi query khớp ~6 seed: `nghỉ phép`, `OKR`, `iConnect`, `phúc lợi`, `bảo mật`, `check-in`. Ngoài seed → kết quả thường + note nhỏ "Trả lời AI tổng hợp sẽ mở rộng thêm chủ đề"
- **Enter → `/search`** trang chi tiết (bố cục cũ + block AI answer nếu có)

### 5. Tri thức — learning hub (theo ảnh 3 iWiki)
- Hero giữa: "Chào An, bạn muốn học gì hôm nay?" + search to + topic chips màu
- "Dành cho bạn" card carousel (tác giả + icon chủ đề) · banner "Đừng để kiến thức ngừng chảy" + CTA → toast concept · "Đã xem gần đây" 2 cột · "Mới gần đây"
- Fixtures mở rộng 5 → ~12 docs (đủ đầy carousel; giữ Finance doc cho deny beat). Detail page giữ + polish

### 6. Mục tiêu — iGoal-style (theo ảnh 4)
- **Chu kỳ selector** (H2 2026) + tabs: Mục tiêu & báo cáo / Sơ đồ mục tiêu / Báo cáo
- **Cây OKR**: Company O → Team O → cá nhân; row O + progress %, expand ra KRs (progress từng KR). Sơ đồ = tree indent đơn giản (không graph libs — YAGNI)
- **Check-in flow**: "Tạo báo cáo" → form prefilled → submit → báo cáo hiện trong "Tổng hợp báo cáo" + status flip. Chip AI A3 soạn hộ draft từ goal-state
- Board 4 trạng thái của v1 → thu thành section "Mục tiêu của tôi" (giữ check-in flip cũ)

### 7. Hồ sơ cá nhân
Header (avatar lớn, tên/role/team, liên hệ email/slack) + sections: **Tổ chức** (manager, đồng đội mini) · **Thâm niên & cột mốc** (timeline) · **Nghỉ phép & phúc lợi** (số ngày phép còn, bảo hiểm, khám SK — mock, nguồn cho AI chip) · **Thiết bị được cấp** · **Hoạt động gần đây** (đọc live: đã ack, đã RSVP) · giữ block Hiển thị + Demo reset

### 8. Sidebar categories + dọn nhãn
- `KHÔNG GIAN CỦA BẠN`: Trang chủ, Cộng đồng, Tin tức, Sự kiện · `PHÁT TRIỂN`: Tri thức, Mục tiêu · `QUẢN LÝ` (manager-only): Tổng quan, Đội ngũ · footer: Tầm nhìn
- Bottom-nav mobile chọn 5: Home, Cộng đồng, Sự kiện, Tri thức, Mục tiêu
- **Sweep bỏ R-badge** trên header module (D2); giữ AiBadge + disclosure trong panel

## Phương án thi công (parallel — lặp mô hình v1 đã chạy mượt)

```
Phase 1 (nền, sequential): types + fixtures (posts, birthdays, milestones, leave,
  agenda, docs 12, OKR tree) + AppState slices (posts/reactions/comments/checkin/reports)
  + sidebar categories + route /community + SearchPalette shell (⌘K, kết quả thường)
  + script-store contract mở rộng + stubs/CSS stubs + resetDemo cover slices mới
   ├─→ Phase 2: Cộng đồng (feed + rail + composer + reactions)      [lớn nhất]
   ├─→ Phase 3: Events (hero countdown + timeline + tabs + detail)
   ├─→ Phase 4: Tri thức restyle
   └─→ Phase 5: Mục tiêu iGoal-style (tree + check-in report)
Phase 6 (sequential): AI scripts mọi module + seeded search answers + Hồ sơ
  + R-badge sweep + presenter script v3 + polish + smoke test
```

Ước lượng: P1 1d · P2 2d · P3 1d · P4 1d · P5 1.5d · P6 2d → **~5-6 ngày** nhờ parallel 2-5.
File ownership lặp công thức v1: P1 đóng băng shared surface; P2-P5 own file rời; P6 sweep.

## Rủi ro & sự thật cần nói thẳng

1. **Ảnh thật**: ảnh tham khảo dùng ảnh sự kiện/người thật — prototype không có. Dùng visual-pattern + emoji cover + initials avatar (đúng style v1). **Nếu owner muốn ảnh thật: gửi file ảnh vào repo, tôi nhúng ở P6** (nhanh, đáng làm cho hero events + feed).
2. **Feed nhiều state mới** → resetDemo phải cover đủ (pattern demoResetCount có sẵn, rủi ro thấp).
3. **Countdown tick từng giây** → visual-check screenshot sẽ diff mỗi lần chạy (chấp nhận — screenshot vẫn để so layout).
4. **Giảm test theo yêu cầu** → khả năng lọt bug UI nhỏ cao hơn v1; đổi lại ra bản sớm. Owner review bù.
5. **Mâu thuẫn tiềm ẩn với pitch BLĐ v1**: bỏ R-badge header làm demo "như thật" hơn — nếu sau này quay lại pitch đầu tư cần bật lại nhãn (giữ component RBadge, chỉ gỡ chỗ render → bật lại 30 phút).
6. **Copy /vision + rehearsal của v1 vẫn treo** — demo v2 xong mới rehearse một thể.

## Tiêu chí thành công
- Người xem demo tự bấm được: đăng bài, thả reaction, chúc sinh nhật, ⌘K hỏi "nghỉ phép", AI soạn báo cáo check-in — không hướng dẫn vẫn không "đơ"
- Golden path mới chạy mượt cả light/dark, 1024px band
- typecheck + build xanh; resetDemo về trạng thái mở màn <5s

## Việc tiếp theo
1. Tạo plan chi tiết 6 phases (file ownership matrix + fixtures enumerated đủ như v1)
2. Build parallel → owner review bản chạy → liệt kê sửa → iterate
3. (Tuỳ chọn) Owner gửi ảnh thật cho hero/feed

## Câu hỏi chưa chốt
1. Tên hiển thị module social: "Cộng đồng" hay "iKame Life"/tên khác? (tạm dùng Cộng đồng)
2. Ảnh thật: owner có gửi không hay dùng pattern? (mặc định pattern)
3. Check-in "Hôm nay của tôi" ở Cộng đồng: check-in gì (văn phòng? daily mood?) — tạm làm check-in sự kiện/ngày làm việc dạng receipt đơn giản
