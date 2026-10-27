---
phase: 5
title: "Đồng bộ dữ liệu, verify 3 lăng kính, review, commit"
status: pending
priority: P1
effort: "3h"
dependencies: [1, 2, 3, 4]
---

# Phase 5: Đồng bộ dữ liệu "như thật", verify, review, commit

## Overview
Làm bản demo nhất quán và đáng tin: mốc thời gian, tên, số liệu khớp nhau giữa Home, Công việc, Hồ sơ, Feed, Admin; chạy kịch bản 3 lăng kính; review; commit; cập nhật demo flow trong pitch doc.

## Requirements
- Mốc thời gian: dữ liệu mới (iCheck tuần, giấy tờ, MCP receipt) dùng "hôm nay" = ngày máy (toLocaleDateString vi-VN) để luôn đúng khi demo; feed/events giữ kịch bản tháng 8 (DEMO_NOW) — chấp nhận, nhưng Home không hiển thị 2 ngày khác nhau cạnh nhau (chào buổi sáng dùng ngày máy; card feed dùng nhãn tương đối).
- Lời chào Home: "Chào buổi sáng/chiều/tối" theo giờ máy, ngày đầy đủ như ảnh iCheck.
- Số liệu khớp: phép 2,5 ở Home = /work = /profile = Trợ lý AI; Mai (manager) có dữ liệu riêng tối thiểu (check-in, phép).
- `resetDemo` phủ mọi state mới: checkIn, weekAttendance (WFH), attendance requests, sensitiveUnlocked, agentMetrics.
- Cập nhật `docs/my-ikame-c-level-pitch-2026-10.md` §B demo flow: thêm bước Công việc/iCheck, Hồ sơ gate, AI hành động MCP, chuyển 3 lăng kính.

## Implementation Steps
1. Rà số liệu/mốc thời gian; sửa mock.
2. Build; preview: kịch bản iKamer → Manager → COM Admin; mobile 375px; F4 reset.
3. code-reviewer subagent → sửa major/minor hợp lý.
4. Commit (sau khi người dùng duyệt); đóng phase; journal.
5. Cập nhật demo flow pitch doc.

## Success Criteria
- [x] Không còn số/mốc lệch nhau trên các màn demo; reset F4 trả về trạng thái đầu
- [x] Build sạch, console sạch, 3 lăng kính + mobile OK
- [x] Review xong, commit, pitch doc cập nhật
