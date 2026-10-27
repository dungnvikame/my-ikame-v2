# My iKame — Góc nhìn & đề xuất trước khi lập kế hoạch phát triển tiếp (27/10/2026)

Đầu vào: định hướng Dũng nêu (Agent Platform, 3 nhóm người dùng, 6 module), ảnh iCheck hiện tại, Slack của anh Nghĩa / chị Nguyệt (T3–T10/2026), lịch sử H1 (v3 app+web, gamification, pilot T4–T5), spec v0.2, prototype hiện tại (commit `17b09b7`).

---

## 1. Hai người ảnh hưởng đang nói gì

### Anh Nghĩa (Tech/AI) — "AI phải chứng minh được hiệu quả, và phải dùng chung"
- **Quy trình AI-native có gate**: Product + Design + **Architecture** đều APPROVED mới READY; Plan và Test chạy song song rồi mới Implement; **agent validate trước mỗi gate người duyệt**. Muốn "workflow hoàn toàn bằng AI, các vị trí kết nối với nhau qua tài liệu AI sinh ra".
- **Cách nhân rộng**: 1 squad đủ vị trí (PIC, PM, UI/UX, Dev, QA, Partner) áp vào 1 sản phẩm → đo → pilot 2–3 sản phẩm → ốp cả team. Tiêu chí hiệu quả: tốc độ, chất lượng, kiểm thử, UX, khả năng nhân rộng/vận hành.
- **MCP tập trung toàn iKame** (26/10): Tâm PIC, output = framework dùng chung; "rủi ro MCP nhiều dù tiện". Đội Managers bên Game rất muốn tính năng AI; "báo cáo bằng MCP rất tiện, sao chưa ưu tiên?".
- Thích **agent chủ động** (proactive), coding agent có framework (Kiro), "Agent Tag chạy theo context Slack/Asana chứ không theo cá nhân".

→ Hệ quả cho My iKame: module AI **không tự build intelligence**, là *client* của MCP framework chung; mỗi tính năng AI phải có số đo trước/sau; bản phát triển tiếp nên là **sản phẩm pilot thứ 2 của squad AI** (sau iGoal), đi qua gate Architecture.

### Chị Nguyệt (P&OD) — "Hiệu quả công việc và gắn kết văn hoá phải song song; dữ liệu phải đúng"
- Sứ mệnh (27/03): *"mục tiêu lớn nhất của một nhân viên là làm hiệu quả, tạo giá trị, được ghi nhận — My iKame giúp công việc và cuộc sống iKamer dễ dàng, thuận tiện, hiệu quả, hạnh phúc hơn. Khía cạnh **công việc** luôn phải thiết kế song song khía cạnh **gắn kết văn hoá**."*
- Ưu tiên P&OD 2026: **HRIS là cấu trúc/nguồn sự thật** (link mượt sang mọi hệ thống), iPayroll, iRefer; **iCheck "chưa phải trọng điểm quản trị năm nay"**, iGrow/iSurvey on hold; My iKame T4 chỉ tập trung Onboarding.
- Rất nhạy với **sai dữ liệu nhân sự** (báo lỗi ngày sinh trên My iKame 07/10) và **phân quyền** (iWiki, iGoal). Muốn nhấn **manager dashboard** khi launching iGoal — tức giá trị cho Manager là thứ chị đang thiếu feedback.

→ Hệ quả: Trang cá nhân & iCheck trong My iKame phải **đọc từ HRIS/iCheck, không nhân bản dữ liệu**; mọi thứ hiện cho Manager phải đúng quyền; "văn hoá" (Feed/Kudos/Sự kiện) và "công việc" (iCheck/OKR/việc hôm nay) phải cùng xuất hiện trên một màn hình, không tách app.

### Bài học H1 (T3–T5)
- v3 đã có: gamification engine (EXP/coin/iQuest/iReward), trigger chấm công iCheck → cộng EXP, AI chatbot + auto-post, admin cơ bản, app mobile. ~100 lượt đổi quà trong pilot → **engagement có thật**.
- Nhưng P&OD feedback: *không hiểu nhiệm vụ, nhầm EXP/coin, không biết đổi quà* → MVP 06/08 cắt gamification. Kết luận: gamification là **lớp tăng tốc có điều kiện** (cần onboarding + rule rõ), không phải lõi.

---

## 2. Góc nhìn của tôi về định hướng Dũng nêu

| Điểm Dũng nêu | Đồng ý | Điều chỉnh đề xuất |
|---|---|---|
| Agent Platform, cá nhân hoá + AI hoá | ✔ | Diễn đạt lại thành **"một shell, ba lăng kính"**: lõi chung (Feed, Sự kiện, Ứng dụng, AI) + lăng kính theo vai (iKamer / Manager / Vận hành) đổi *Home, nav, quyền và intent AI* — không phải 3 giao diện riêng. Prototype đã có cơ chế `perspective`; chỉ cần bật lại Manager và định nghĩa Vận hành. |
| 3 nhóm: nhân sự / manager / vận hành | ✔ với lưu ý | Spec v0.2 (D2) chốt *Operations dùng My iKame Studio, không phải audience*. Đề xuất: **Vận hành trong My iKame = lăng kính "COM/HR Admin" giới hạn ở nội dung, sự kiện, đo lường, duyệt nhanh** (đã build COM Admin) — không kéo nghiệp vụ cấu hình sâu (HRIS, payroll, legal) vào, để tránh "nồi cám thập cẩm" lần nữa. |
| iKame Feed đầy đủ mạng xã hội | ✔ | Giữ đúng *mạng xã hội doanh nghiệp*: kudos, nhóm/câu lạc bộ, album, stories "bỏ lỡ"; **không** chat realtime (Slack vẫn giữ việc đó). Thêm vòng lặp COM đã có. |
| Sự kiện | ✔ | Đã đủ cho launch; bước tiếp là **đăng ký/điểm danh gắn iCheck** và khảo sát → Analytics COM. |
| Ứng dụng theo quyền | ✔ | Đúng hướng KR3; nguồn quyền phải lấy từ **HRIS/SSO** (role, team) chứ không cấu hình tay trong My iKame. |
| Module iCheck | ✔ nhưng **mỏng** | Chị Nguyệt: iCheck không trọng điểm. Đưa vào My iKame **phần người dùng chạm mỗi ngày** (ảnh đính kèm: trạng thái chấm công hôm nay, 4 nút nhanh, ngày phép còn lại, đề xuất gần nhất) dưới dạng widget trên Home + tab Công việc; lịch tháng/lịch sử **deep-link** sang iCheck. Các hành động (xin nghỉ, WFH, quên chấm công) đi qua **Trợ lý AI → MCP iCheck**, không build form lại. |
| Trang cá nhân (giấy tờ, hợp đồng) | ✔ | HRIS là nguồn; My iKame chỉ *hiển thị + nhắc việc* (hợp đồng sắp hết hạn, giấy tờ thiếu, thiết bị bảo hành). Dữ liệu nhạy cảm (lương, C&B) gate bằng xác thực lại (ý Long). Prototype `ProfilePage` đã có 70%. |
| Module AI là lõi | ✔ | Định nghĩa lõi = **Daily Work Hub + hành động có duyệt**: agent gom việc từ HRIS/iCheck/iGoal/iWiki/Asana/Calendar, đề xuất hành động, người duyệt, agent thực thi qua MCP, có receipt/audit (pattern đã có trong AssistantWorkspace). Mỗi intent gắn 1 số đo (thời gian hoàn thành, tỷ lệ duyệt). |

### Ba điều tôi khuyên **không** làm trong bản tiếp theo
1. Không build lại lịch chấm công / form nghỉ phép bên trong My iKame — mất 2–3 tuần cho thứ chị Nguyệt coi là không trọng điểm.
2. Không đưa gamification trở lại trước khi Feed thành thói quen và có onboarding giải thích (bài học H1).
3. Không tự xây chatbot/LLM riêng — chờ framework MCP của Tâm, My iKame là client đầu tiên có use-case rõ (anh Nghĩa đang cần "sản phẩm pilot thứ 2").

---

## 3. Đề xuất kiến trúc trải nghiệm — "Một shell, ba lăng kính"

```
Shell chung: Topbar (search ⌘K · launcher · Hỏi AI · thông báo) · Sidebar theo lăng kính · Bottom-nav mobile
Lõi dùng chung: iKame Feed · Sự kiện · Ứng dụng · Trợ lý AI · Thông báo · Hồ sơ

Lăng kính iKamer      Lăng kính Manager            Lăng kính Vận hành (COM/HR Admin)
Home = Việc hôm nay   Home = Attention queue       Home = Tổng quan COM (đã có)
+ widget iCheck       + team check-in/OKR/đơn      + duyệt nội dung, push, đo
+ Việc của tôi        + 360° thành viên (đã có)    + sự kiện & khảo sát
+ Lối tắt app         + duyệt nhanh (đã có)        + báo cáo WAU/ack
Intent AI cá nhân     Intent AI quản lý (đã có)    Intent AI vận hành (soạn thông báo, tóm tắt feedback)
```

Nguyên tắc chung (spec D1/D8/D9 + ý anh Nghĩa): native chỉ việc làm xong trong một phiên ngắn; mọi hành động đi qua **đề xuất → duyệt → thực thi → receipt**; permission từ HRIS/SSO; AI là client MCP.

---

## 4. Thứ tự ưu tiên đề xuất cho kế hoạch tiếp theo (để bàn, chưa chốt)

| Bước | Nội dung | Vì sao trước |
|---|---|---|
| 1 | **Lăng kính iKamer hoàn chỉnh**: Home gộp *Việc hôm nay* (AI) + **widget iCheck** (ảnh đính kèm) + Feed/Sự kiện nổi bật; tab *Công việc* = iCheck mỏng + OKR + đơn/đề xuất | Đây là màn hình WAU phụ thuộc; iCheck là thứ 100% iKamer chạm mỗi ngày → kéo thói quen cho Feed |
| 2 | **Trang cá nhân** đủ: HRIS info, hợp đồng/giấy tờ + nhắc hạn, thiết bị, thâm niên, C&B có gate | Ít rủi ro, dữ liệu sẵn, chị Nguyệt quan tâm đúng dữ liệu |
| 3 | **Trợ lý AI → hành động qua MCP** (mock contract trước): xin nghỉ/WFH/quên chấm công (iCheck), check-in OKR (iGoal), tạo request (iRequest), tìm tài liệu (iWiki) — mỗi intent có receipt + số đo | Khớp framework MCP chung; là use-case pilot cho squad AI |
| 4 | **Bật lại lăng kính Manager** (code có sẵn: overview, team 360°, duyệt) + intent AI quản lý | Manager là nhóm chị Nguyệt muốn thấy giá trị; code đã có ~80% |
| 5 | **Ứng dụng theo quyền** từ HRIS role/team + SSO; ẩn app không có quyền | KR3 |
| 6 | Vận hành: mở rộng COM Admin thành HR Admin nhẹ (duyệt đơn, onboarding checklist) — *chỉ khi* P&OD xác nhận nhu cầu | Tránh scope creep |
| Sau | Gamification v2 (có onboarding), Clubs, iJourney, album kỷ niệm | Chờ Feed thành thói quen |

Cách làm: áp **quy trình AI-native của anh Nghĩa** cho bản này — PRD + Design + **Architecture** (ma trận permission → DB → API → notification → analytics cho từng module) duyệt trước, test plan viết song song plan, agent validate trước gate; đo 5 tiêu chí hiệu quả để có bài đánh giá cho buổi sharing cả team.

---

## 5. Câu hỏi cần Dũng chốt trước khi lập plan chi tiết
1. "Vận hành" = COM/HR Admin lens trong My iKame (đề xuất) hay bao gồm cả cấu hình nghiệp vụ sâu (trái D2 spec)?
2. iCheck: **widget + deep-link + hành động qua MCP** (đề xuất) hay tái hiện cả lịch tháng/lịch sử trong My iKame?
3. Dữ liệu HRIS cho Trang cá nhân: trường nào được phép hiển thị, trường nào gate (lương/C&B)?
4. Có bật lại lăng kính Manager trong bản tiếp theo không, hay giữ parked tới sau launch?
5. Bản tiếp theo vẫn là prototype mock để chốt định hướng, hay bắt đầu nối MCP/HRIS thật (phụ thuộc Tâm/HRIS)?
6. Gamification: xác nhận để ngoài bản tiếp theo?
