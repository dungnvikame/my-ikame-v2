/**
 * Phase 5 — `/vision` screen. Stage backdrop for stop 0 (mở màn #intro) và stop 6
 * (đóng màn #ladder) của buổi demo BLĐ. Pure static content, zero AppState reads.
 *
 * COPY CHECKPOINT (RED TEAM F12): mọi chuỗi tiếng Việt dưới đây là DRAFT — cần
 * product owner duyệt trước khi tính phase done (xem phase-05-vision-screen.md §3).
 */
import { AiBadge } from '../components/AiBadge';
import { RBadge } from '../components/RBadge';
import type { AiLevel, ReleaseTag } from '../types';

type LadderRow = { level: AiLevel | 'A0'; capability: string; condition: string; statusTag: string; statusDetail: string };

const LADDER: LadderRow[] = [
  { level: 'A0', capability: 'Search + filter', condition: 'Permission-aware index', statusTag: 'Demo hàng thật', statusDetail: 'Đang chạy tại /search trong prototype này' },
  { level: 'A1', capability: 'Tóm tắt một tài liệu', condition: 'Citation, kiểm tra quyền truy cập nguồn', statusTag: 'Demo scripted', statusDetail: 'Ask iKame — câu trả lời dựng sẵn, chưa nối LLM thật' },
  { level: 'A2', capability: 'Trả lời xuyên nguồn, chỉ đọc', condition: 'Retrieval eval, ACL theo từng nguồn, feedback', statusTag: 'Concept — cần foundation', statusDetail: 'Scripted trong Ask iKame để hình dung, chưa có retrieval thật' },
  { level: 'A3', capability: 'Soạn thảo hành động (draft)', condition: 'Tool schema, kiểm tra policy, màn xác nhận', statusTag: 'Concept — cần foundation', statusDetail: 'Scripted — cần policy engine trước khi làm thật' },
  { level: 'A4', capability: 'Thực thi hành động rủi ro thấp', condition: 'Idempotency, audit, receipt, compensation', statusTag: 'Concept — cần foundation', statusDetail: 'Scripted (tự RSVP) — cần audit/compensation trước khi làm thật' },
];

type RoadmapItem = { tag: ReleaseTag; title: string; goal: string; statusTag: string; statusDetail: string };

const ROADMAP: RoadmapItem[] = [
  { tag: 'R1', title: 'H2 Production Core', goal: 'Newsfeed + Event an toàn: SSO, audience, RSVP, notification, analytics', statusTag: 'Demo hàng thật (prototype)', statusDetail: 'Scope này đang chạy hàng thật trong prototype hôm nay — chờ build production' },
  { tag: 'R2', title: 'Knowledge read pilot', goal: 'Permission-aware search + reader cho iWiki', statusTag: 'Concept đã demo', statusDetail: 'Xem tab Knowledge trong prototype' },
  { tag: 'R3', title: 'Goal action pilot', goal: 'Tóm tắt goal + check-in đơn giản, Manager attention', statusTag: 'Concept đã demo', statusDetail: 'Xem tab Goals trong prototype' },
  { tag: 'R4', title: 'AI read-only', goal: 'Ask, grounded answer, citation, permission filter', statusTag: 'Concept scripted', statusDetail: 'Ask iKame — A0-A2' },
  { tag: 'R5', title: 'Assisted action', goal: 'Draft/execute hành động có kiểm soát, human confirm', statusTag: 'Concept scripted', statusDetail: 'Ask iKame — A3-A4' },
];

const STATS = [
  { number: '40%', label: 'Enterprise apps sẽ có agent AI theo tác vụ, cuối 2026 (từ <5% năm 2025)', source: 'Gartner, 8/2025', meaning: 'Board có 3–6 tháng để chốt chiến lược AI trước khi tụt lại phía sau.' },
  { number: '95% / 5%', label: 'Pilot GenAI thất bại — chỉ 5% "thiết kế cho ma sát" (memory, learning loop, governance) sống tới production', source: 'MIT 2025, qua Forbes 8/2025', meaning: 'Vì vậy chúng ta build nền tảng permission + data trước khi build chatbot — đúng thứ tự ladder A0→A4.' },
  { number: '91%', label: 'Ca xử lý nhân sự tự động xong, không cần chuyển tiếp (Now Assist for Employee Center)', source: 'ServiceNow, 9/2025', meaning: 'AI trong workflow nhân sự đã chứng minh hiệu quả ở quy mô thật, không còn là khái niệm.' },
  { number: '1.000 / 84.000', label: 'AI agent đang phục vụ nhân viên tại FPT (hệ sinh thái PeopleX)', source: 'FPT IS, Vietnam Labour Forum 2025', meaning: 'Một công ty công nghệ Việt Nam tier-1 đã triển khai thật ở quy mô lớn — không phải chuyện viễn tưởng.' },
];

const BENCHMARKS = [
  'Viva Connections — card + audience preview trước khi publish',
  'ServiceNow Employee Center — active items thay vì dashboard tĩnh',
  'Workday Manager Insights Hub — required trước optional, overdue trước due soon',
  'Staffbase — acknowledgement bắt buộc + audit trail cho tin mandatory',
  'Glean Enterprise Search — permission-aware, không lộ nội dung sai quyền',
];

const USEFUL_ACTIONS = ['Acknowledge tin mandatory', 'RSVP/hủy sự kiện', 'Mở đúng kết quả tìm kiếm', 'Hoàn thành goal check-in', 'Manager xử lý attention item'];

export function VisionPage() {
  return (
    <div className="page vision-page">
      <section id="intro" className="vision-hero">
        <p className="eyebrow">TẦM NHÌN SẢN PHẨM</p>
        <h1>My iKame giúp mỗi iKamer biết hôm nay có gì cần đọc, cần tham gia, cần làm — và giúp mỗi Manager biết đội ngũ đang có ngoại lệ nào cần mình xử lý, trong một trải nghiệm cá nhân hóa, an toàn và nhất quán.</h1>
        <p className="vision-quote">"Một capability chỉ native trong My iKame nếu phần lớn người dùng hoàn thành nó trong một ngữ cảnh, một phiên ngắn — không cần hiểu cấu hình nghiệp vụ phía sau. Không qua được phép thử này, chúng ta hiển thị summary + CTA + deep link."</p>
      </section>

      <section className="vision-section vision-problem">
        <h2>Vì sao phải làm My iKame</h2>
        <div className="vision-two-col">
          <div className="vision-col vision-col--before">
            <p className="eyebrow">HIỆN TRẠNG</p>
            <ul>
              <li>iKamer phải nhớ tên và cách dùng nhiều công cụ để đọc thông tin hoặc hoàn thành việc.</li>
              <li>Manager bị đưa nhiều số liệu nhưng thiếu danh sách ngoại lệ có thể hành động.</li>
              <li>Mỗi công cụ tối ưu riêng domain của nó — chưa có lớp tối ưu hành trình xuyên domain.</li>
            </ul>
          </div>
          <div className="vision-col vision-col--after">
            <p className="eyebrow">SAU MY IKAME</p>
            <ul>
              <li>iKamer mở một điểm vào, nhận đúng nội dung/tác vụ theo vai trò, đơn vị, thời điểm.</li>
              <li>Manager xử lý nhanh các item cần chú ý mà không phải duyệt nhiều dashboard.</li>
              <li>Domain systems vẫn là source of truth; mỗi integration mới tái sử dụng chung một bộ contract.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="vision-section vision-gate">
        <h2>Một "Gate", không phải một "super-app"</h2>
        <p>My iKame chỉ giữ tác vụ phổ biến, ngắn, đúng ngữ cảnh. Nghiệp vụ cấu hình hoặc vận hành sâu — deep link sang đúng công cụ domain.</p>
        <div className="vision-diagram">
          <div className="vision-diagram-box">iKamer / Manager</div>
          <span className="vision-diagram-arrow">→</span>
          <div className="vision-diagram-box vision-diagram-box--gate">My iKame — Gate</div>
          <span className="vision-diagram-arrow">→</span>
          <div className="vision-diagram-box">Công cụ domain<br />iWiki · iGoal · HRIS…</div>
        </div>
        <p className="vision-caption">Ở lại: việc ngắn, đúng ngữ cảnh &nbsp;·&nbsp; Đi tiếp: nghiệp vụ sâu → deep link có context</p>
      </section>

      <section className="vision-section vision-northstar">
        <h2>North Star: Weekly Useful Action Rate (WUAR)</h2>
        <pre className="vision-formula">{'Số iKamer/Manager đủ điều kiện thực hiện ≥1 useful action / tuần\n───────────────────────────────────────────────────────\nTổng số iKamer/Manager đủ điều kiện trong tuần'}</pre>
        <p className="eyebrow">USEFUL ACTION (ALLOW-LIST)</p>
        <div className="vision-chips">
          {USEFUL_ACTIONS.map((action) => <span key={action} className="vision-chip">{action}</span>)}
        </div>
        <p className="vision-caption">Đo hành động hoàn thành — không đo page view, scroll hay reaction.</p>
      </section>

      <section id="ladder" className="vision-section vision-ladder">
        <h2>Thang trưởng thành AI: A0 → A4</h2>
        <div className="vision-ladder-rows">
          {LADDER.map((row) => (
            <div className="vision-ladder-row" key={row.level}>
              {row.level === 'A0' ? <span className="ai-badge ladder-badge-a0"><strong>A0</strong> · Search + filter</span> : <AiBadge level={row.level} />}
              <div className="vision-ladder-copy">
                <strong>{row.capability}</strong>
                <span>Điều kiện: {row.condition}</span>
              </div>
              <div className="vision-ladder-status">
                <span className="status-pill status-pill--neutral">{row.statusTag}</span>
                <small>{row.statusDetail}</small>
              </div>
            </div>
          ))}
        </div>
        <p className="vision-caption">Không build chatbot trước khi có nền — đó là lý do 95% pilot GenAI chết, còn chúng ta thì không.</p>
      </section>

      <section className="vision-section vision-roadmap">
        <h2>Bản đồ R1 → R5</h2>
        <div className="vision-timeline">
          <div className="vision-timeline-item vision-timeline-item--done">
            <span className="vision-timeline-tag">R0</span>
            <strong>Vibe-code prototype</strong>
            <p>Kiểm chứng IA, card hierarchy, 2 role experience</p>
            <span className="status-pill status-pill--success">Hoàn thành — bạn đang xem nó</span>
          </div>
          <div className="vision-timeline-marker">CHÚNG TA Ở ĐÂY</div>
          {ROADMAP.map((item) => (
            <div className="vision-timeline-item" key={item.tag}>
              <span className="vision-timeline-tag">{item.tag}</span>
              {item.tag !== 'R1' && <RBadge tag={item.tag as Exclude<ReleaseTag, 'R1'>} />}
              <strong>{item.title}</strong>
              <p>{item.goal}</p>
              <span className="status-pill status-pill--neutral">{item.statusTag}</span>
              <small>{item.statusDetail}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="vision-section vision-stats">
        <h2>Vì sao "ours" sẽ không thất bại</h2>
        <div className="vision-stat-grid">
          {STATS.map((stat) => (
            <article className="vision-stat-card" key={stat.label}>
              <strong>{stat.number}</strong>
              <p>{stat.label}</p>
              <p className="vision-stat-meaning">{stat.meaning}</p>
              <footer>Nguồn: {stat.source}</footer>
            </article>
          ))}
        </div>
      </section>

      <section className="vision-section vision-benchmark">
        <h2>Học pattern, không mua nguyên khối</h2>
        <ul className="vision-benchmark-list">
          {BENCHMARKS.map((line) => <li key={line}>{line}</li>)}
        </ul>
        <p className="vision-caption">Câu trả lời cho "sao không mua nguyên một platform?": mỗi platform tối ưu một domain — chúng ta học pattern tốt nhất của từng cái, ghép vào lớp trải nghiệm riêng của mình.</p>
      </section>

      <section className="vision-section vision-closing">
        <h2>My iKame — một điểm vào, đúng việc, đúng người, đúng lúc.</h2>
        <p className="vision-decision">Quyết định hôm nay: chốt tầm nhìn để mở scope H2.</p>
      </section>
    </div>
  );
}
