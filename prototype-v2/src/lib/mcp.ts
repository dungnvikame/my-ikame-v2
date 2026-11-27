// PRD §7.7 MCP Contract Registry (7 servers, 20 tools) & Intent Router
import {
  AiActionProposal,
  AiMessage,
  EventItem,
  FeedPost,
  KnowledgeDoc,
  LensKey,
  McpServerStatus,
  ObjectiveItem,
  PersonProfile,
  TodayActionItem,
  WorkRequest,
} from '../types';

export const INITIAL_MCP_SERVERS: McpServerStatus[] = [
  {
    id: 'hris',
    name: 'HRIS',
    owner: 'P&OD',
    status: 'connected',
    readTools: ['get_profile', 'get_pending_acks', 'list_documents'],
    writeTools: ['acknowledge_policy'],
    latencyMs: 112,
  },
  {
    id: 'icheck',
    name: 'iCheck',
    owner: 'BM',
    status: 'connected',
    readTools: ['get_today_status', 'get_leave_balance'],
    writeTools: [
      'create_leave_request',
      'create_wfh_request',
      'report_missing_checkin',
      'create_late_early_request',
    ],
    latencyMs: 94,
  },
  {
    id: 'igoal',
    name: 'iGoal',
    owner: 'BM',
    status: 'connected',
    readTools: ['get_my_objectives'],
    writeTools: ['submit_checkin'],
    latencyMs: 128,
  },
  {
    id: 'iwiki',
    name: 'iWiki',
    owner: 'BM',
    status: 'connected',
    readTools: ['search'],
    writeTools: ['create_draft'],
    latencyMs: 85,
  },
  {
    id: 'irequest',
    name: 'iRequest',
    owner: 'BM',
    status: 'connected',
    readTools: ['get_categories'],
    writeTools: ['create_ticket'],
    latencyMs: 141,
  },
  {
    id: 'asana',
    name: 'Asana',
    owner: 'IT Platform',
    status: 'connected',
    readTools: ['list_my_tasks'],
    writeTools: [],
    latencyMs: 196,
  },
  {
    id: 'gcal',
    name: 'Google Calendar',
    owner: 'IT Platform',
    status: 'connected',
    readTools: ['list_events', 'find_free_room'],
    writeTools: ['book_room'],
    latencyMs: 164,
  },
];

export function routeAiPrompt(params: {
  prompt: string;
  lens: LensKey;
  person: PersonProfile;
  todayItems: TodayActionItem[];
  servers: McpServerStatus[];
  posts: FeedPost[];
  events: EventItem[];
  objectives: ObjectiveItem[];
  requests: WorkRequest[];
  teamMembers: PersonProfile[];
  knowledgeDocs: KnowledgeDoc[];
}): AiMessage {
  const { prompt, lens, person, todayItems, servers, posts, events, objectives, requests, teamMembers, knowledgeDocs } =
    params;
  const q = prompt.normalize('NFC').toLowerCase().trim();
  const id = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const serverStatus = (serverId: string) => servers.find((s) => s.id === serverId);

  // 1. Distinguish Policy Question vs Action Request (PRD §7.7 AI-7)
  const isPolicyQuestion =
    (q.includes('chính sách') ||
      q.includes('quy định') ||
      q.includes('bao nhiêu ngày') ||
      q.includes('thế nào') ||
      q.includes('như thế nào') ||
      q.includes('cách tính') ||
      q.includes('hướng dẫn') ||
      q.includes('được nghỉ')) &&
    !q.includes('tạo đơn') &&
    !q.includes('gửi đơn') &&
    !q.includes('đăng ký');

  // 2. "Hôm nay tôi cần làm gì?" (PRD §7.7 AI-2)
  if (
    q.includes('hôm nay') ||
    q.includes('cần làm gì') ||
    q.includes('việc hôm nay') ||
    q.includes('bản tin sáng')
  ) {
    const degraded = servers.filter((s) => s.status !== 'connected');
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text: `Chào ${person.name.split(' ').slice(-1)[0]}, tôi đã tổng hợp **${todayItems.length} mục ưu tiên** từ cùng nguồn với Trang chủ và Bản tin sáng của bạn:`,
      sources: ['COM', 'iCheck', 'HRIS', 'iGoal', 'Asana', 'Google Calendar'],
      todayItems,
      warningNote:
        degraded.length > 0
          ? `Lưu ý: ${degraded.map((d) => d.name).join(', ')} đang ${degraded[0].status === 'offline' ? 'ngoại tuyến' : 'phản hồi chậm'} — dữ liệu từ nguồn này tạm thời chưa cập nhật mới nhất.`
          : undefined,
    };
  }

  // 3. Policy Questions -> Search iWiki (AI-7)
  if (isPolicyQuestion) {
    const iwiki = serverStatus('iwiki');
    if (iwiki?.status === 'offline') {
      return {
        id,
        role: 'assistant',
        timestamp: nowStr,
        text: 'Hệ thống **iWiki** hiện đang tạm ngưng kết nối qua MCP nên tôi không thể tra cứu chính sách chính xác lúc này. Tôi không tự suy đoán nội dung chính sách — bạn vui lòng thử lại sau ít phút hoặc liên hệ P&OD.',
        sources: ['iWiki · offline'],
        warningNote: 'MCP server iWiki đang ở trạng thái offline.',
      };
    }
    const matchedDoc =
      knowledgeDocs.find((d) =>
        q.includes('phép') || q.includes('nghỉ')
          ? d.id === 'doc-leave'
          : q.includes('wfh') || q.includes('từ xa')
            ? d.id === 'doc-wfh'
            : d.id === 'doc-onboarding'
      ) || knowledgeDocs[0];
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text: `Theo tài liệu **${matchedDoc.title}** (cập nhật ${matchedDoc.updatedAt}):\n\n${matchedDoc.summary}\n\n• ${matchedDoc.content[0]}\n• ${matchedDoc.content[1]}\n\n*(Đây là câu hỏi tra cứu chính sách nên tôi chỉ trích dẫn từ iWiki, không tạo đơn tự động. Nếu bạn muốn gửi đơn, hãy nói "Xin nghỉ phép..." hoặc "Đăng ký WFH...".)*`,
      sources: [`iWiki · ${matchedDoc.title}`, 'MCP · iwiki.search'],
    };
  }

  // 4. Leave Balance Inquiry
  if (q.includes('số dư phép') || q.includes('còn bao nhiêu phép') || q.includes('phép năm còn')) {
    const icheck = serverStatus('icheck');
    if (icheck?.status === 'offline') {
      return {
        id,
        role: 'assistant',
        timestamp: nowStr,
        text: 'Không thể lấy số dư phép vì MCP server **iCheck** đang ngoại tuyến. Bạn vui lòng kiểm tra lại sau khi kết nối khôi phục.',
        sources: ['iCheck · offline'],
        warningNote: 'Hệ thống nguồn iCheck đang offline.',
      };
    }
    const lb = person.leaveBalance;
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text: `Số dư ngày phép hiện tại của **${person.name}** (đồng bộ ${lb.syncedAt}):\n\n• **Phép năm còn lại:** ${lb.annualRemaining} / ${lb.annualTotal} ngày\n• **Phép năm cũ chuyển sang:** ${lb.carriedOver} ngày\n• **Phép ốm có hưởng lương:** ${lb.sickRemaining} ngày\n• **Phép hỉ / chế độ:** ${lb.weddingLeave} ngày`,
      sources: ['iCheck · get_leave_balance'],
    };
  }

  // 5. Manager-Only Intents (PRD §7.7 AI-6)
  if (
    q.includes('tình hình team') ||
    q.includes('ai cần chú ý') ||
    q.includes('đơn chờ duyệt') ||
    q.includes('nhắc check-in') ||
    q.includes('okr team')
  ) {
    if (lens !== 'manager') {
      return {
        id,
        role: 'assistant',
        timestamp: nowStr,
        text: 'Thông tin tổng hợp đội ngũ và duyệt đơn chỉ khả dụng ở **lăng kính Manager** theo phân quyền HRIS. Hãy chuyển sang lăng kính Manager ở thanh bên nếu bạn có vai trò quản lý.',
        sources: ['HRIS · Access Control'],
      };
    }
    if (q.includes('đơn chờ duyệt')) {
      const pending = requests.filter((r) => r.status === 'Chờ duyệt');
      return {
        id,
        role: 'assistant',
        timestamp: nowStr,
        text:
          pending.length === 0
            ? 'Hiện tại team của bạn **không còn đơn nào chờ duyệt**. Mọi yêu cầu đều đã được xử lý!'
            : `Team bạn đang có **${pending.length} đơn chờ duyệt**:\n\n${pending
                .map((r) => `• **${r.personName}** — ${r.type}: ${r.summary} (${r.dateRange})`)
                .join('\n')}\n\nBạn có thể duyệt nhanh ngay tại **Tổng quan Manager** (/manager/overview).`,
        sources: ['iCheck · Team Queue', 'iRequest · Pending'],
      };
    }
    if (q.includes('nhắc check-in')) {
      return {
        id,
        role: 'assistant',
        timestamp: nowStr,
        text: 'Tôi đã soạn sẵn tin nhắn nhẹ nhàng gửi tới **Đặng Quốc Minh** (đang trễ check-in OKR tuần 48):\n\n> *"Chào Minh ơi, tuần này team mình chuẩn bị chốt tiến độ tuần 48 trên iGoal. Minh tranh thủ cập nhật giúp Mai trước 16h chiều nay nhé, nếu có vướng mắc gì nhắn Mai hỗ trợ liền nha!"*\n\nBạn có thể sao chép gửi qua Slack hoặc đặt lịch 1:1 trực tiếp trong thẻ Tín hiệu sớm.',
        sources: ['iGoal · Team Check-in', 'Manager AI Brief'],
      };
    }
    const activeCount = teamMembers.filter((m) => m.pulse?.activeThisWeek).length;
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text: `**Tóm tắt nhanh nhịp team tuần 48:**\n\n• **Team WAER:** ${activeCount}/${teamMembers.length} thành viên hoạt động có nghĩa (${Math.round((activeCount / teamMembers.length) * 100)}%)\n• **Cần quan tâm sớm:** **Đặng Quốc Minh** (chưa hoạt động tuần này, chưa nhận Kudos 2 tuần, trễ check-in OKR)\n• **Người mới:** **Phạm Gia Huy** đang ở Ngày 32/60, tiến độ tốt nhưng còn 1 quest mốc 30 ngày cần chốt.\n\n*Lưu ý: Tín hiệu sớm là gợi ý để quan tâm và hỗ trợ, không phải điểm đánh giá hiệu suất.*`,
      sources: ['HRIS · Roster', 'iGoal · OKR', 'My iKame · Engagement'],
    };
  }

  // 6. Action Intents -> Generate Human-in-the-Loop MCP Proposal (PRD §7.7 AI-3, AI-4, AI-5)
  const makeProposal = (proposal: Omit<AiActionProposal, 'id' | 'status'>): AiMessage => {
    const srv = serverStatus(proposal.server.toLowerCase().replace(/\s+/g, ''));
    const matchSrv = servers.find((s) => s.name.toLowerCase() === proposal.server.toLowerCase());
    if (matchSrv?.status === 'offline' || srv?.status === 'offline') {
      return {
        id,
        role: 'assistant',
        timestamp: nowStr,
        text: `Không thể gửi lệnh tới **${proposal.server}** vì MCP server đang ở trạng thái **offline**. Tôi đã giữ thông tin nháp — vui lòng thử lại khi hệ thống kết nối lại.`,
        sources: [`${proposal.server} · offline`],
        warningNote: `MCP ${proposal.server} tạm ngưng kết nối.`,
      };
    }
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text: `Tôi đã soạn sẵn đề xuất **${proposal.title}** qua MCP. Bạn hãy kiểm tra hoặc chỉnh sửa các trường bên dưới rồi bấm **Duyệt & gửi** để thực thi:`,
      sources: [`MCP · ${proposal.server}.${proposal.tool}`],
      actionProposal: {
        ...proposal,
        id: `prop-${Date.now()}`,
        status: 'pending',
      },
    };
  };

  if (q.includes('nghỉ phép') || q.includes('xin nghỉ')) {
    return makeProposal({
      server: 'iCheck',
      tool: 'create_leave_request',
      title: 'Đơn xin nghỉ phép năm',
      description: `Số dư phép hiện tại: ${person.leaveBalance.annualRemaining} ngày. Đơn sẽ gửi trực tiếp tới ${person.managerName}.`,
      fields: [
        { key: 'leaveType', label: 'Loại phép', value: 'Phép năm', type: 'select', options: ['Phép năm', 'Phép ốm', 'Phép hỉ'] },
        { key: 'dateRange', label: 'Thời gian nghỉ', value: 'Thứ 6, 28/11/2026 (Cả ngày)', type: 'text' },
        { key: 'reason', label: 'Lý do', value: 'Giải quyết việc cá nhân gia đình', type: 'text' },
      ],
    });
  }

  if (q.includes('wfh') || q.includes('làm việc từ xa') || q.includes('tại nhà')) {
    return makeProposal({
      server: 'iCheck',
      tool: 'create_wfh_request',
      title: 'Đăng ký làm việc từ xa (WFH)',
      description: 'Yêu cầu WFH sẽ được đồng bộ sang iCheck và gửi thông báo duyệt tới quản lý trực tiếp.',
      fields: [
        { key: 'dateRange', label: 'Ngày WFH', value: 'Thứ 2, 30/11/2026', type: 'text' },
        { key: 'reason', label: 'Kế hoạch công việc', value: 'Tập trung hoàn thiện tài liệu thiết kế & họp online cùng team', type: 'text' },
      ],
    });
  }

  if (q.includes('quên chấm công') || q.includes('bổ sung chấm công')) {
    return makeProposal({
      server: 'iCheck',
      tool: 'report_missing_checkin',
      title: 'Bổ sung chấm công',
      description: 'Gửi giải trình bổ sung giờ chấm công vào hệ thống iCheck.',
      fields: [
        { key: 'dateRange', label: 'Ngày & giờ thực tế', value: '27/11/2026 · Vào 08:28', type: 'text' },
        { key: 'reason', label: 'Lý do', value: 'Quên quẹt thẻ khi vào sảnh tầng 5', type: 'text' },
      ],
    });
  }

  if (q.includes('đi muộn') || q.includes('về sớm')) {
    return makeProposal({
      server: 'iCheck',
      tool: 'create_late_early_request',
      title: 'Đơn xin đi muộn / về sớm',
      description: 'Đăng ký linh hoạt giờ vào/ra trên iCheck.',
      fields: [
        { key: 'dateRange', label: 'Khung giờ', value: '28/11/2026 · Đến lúc 09:30 (muộn 60 phút)', type: 'text' },
        { key: 'reason', label: 'Lý do', value: 'Khám sức khoẻ định kỳ buổi sáng', type: 'text' },
      ],
    });
  }

  if (q.includes('phòng họp') || q.includes('đặt phòng')) {
    return makeProposal({
      server: 'Google Calendar',
      tool: 'book_room',
      title: 'Đặt phòng họp nội bộ',
      description: 'Đã tìm thấy phòng trống phù hợp qua Google Calendar MCP.',
      fields: [
        { key: 'room', label: 'Phòng họp', value: 'Phòng Sao Hoả — Tầng 5 (8 chỗ)', type: 'select', options: ['Phòng Sao Hoả — Tầng 5 (8 chỗ)', 'Phòng Hải Âu — Tầng 6 (12 chỗ)', 'Focus Booth B2 (4 chỗ)'] },
        { key: 'dateRange', label: 'Khung giờ', value: 'Hôm nay 14:00 – 15:00', type: 'text' },
        { key: 'reason', label: 'Nội dung cuộc họp', value: 'Review thiết kế My iKame R1', type: 'text' },
      ],
    });
  }

  if (q.includes('báo cáo tuần') || q.includes('weekly report')) {
    const myOkr = objectives.find((o) => o.ownerId === person.id) || objectives[0];
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text: `**Bản nháp Báo cáo Tuần 48 cho ${person.name}:**\n\n• **Hoàn thành nổi bật:** Chốt thiết kế Trang chủ My iKame v2 (Mascot ngọn lửa, Theme Noel Light/Dark, Omni-Search).\n• **Tiến độ OKR / EKS:** "${myOkr.title}" đạt **${myOkr.progress}%**.\n• **Kế hoạch tuần tới:** Triển khai tối ưu các trang con và kiểm thử cùng team QA/COM.\n• **Vướng mắc cần hỗ trợ:** Không có điểm nghẽn lớn.`,
      sources: ['iGoal · OKR', 'Asana · Sprint 24', 'iCheck · Tuần 48'],
    };
  }

  if (q.includes('check-in') || q.includes('okr') || q.includes('mục tiêu')) {
    const myOkr = objectives.find((o) => o.ownerId === person.id) || objectives[0];
    return makeProposal({
      server: 'iGoal',
      tool: 'submit_checkin',
      title: 'Check-in OKR tuần 48',
      description: `Cập nhật tiến độ cho mục tiêu "${myOkr.title}".`,
      fields: [
        { key: 'objective', label: 'Mục tiêu', value: myOkr.title, type: 'text' },
        { key: 'progress', label: 'Tiến độ mới (%)', value: `${Math.min(100, myOkr.progress + 8)}%`, type: 'text' },
        { key: 'reason', label: 'Ghi chú tuần này', value: 'Đã hoàn tất thiết kế cốt lõi và nghiệm thu cùng COM/Tech', type: 'text' },
      ],
    });
  }

  if (q.includes('request') || q.includes('it') || q.includes('thiết bị') || q.includes('hành chính')) {
    return makeProposal({
      server: 'iRequest',
      tool: 'create_ticket',
      title: 'Tạo ticket iRequest (IT / Hành chính)',
      description: 'Ticket sẽ được chuyển đúng hàng đợi bộ phận hỗ trợ.',
      fields: [
        { key: 'category', label: 'Nhóm yêu cầu', value: 'Hỗ trợ IT & Thiết bị', type: 'select', options: ['Hỗ trợ IT & Thiết bị', 'Hành chính văn phòng', 'Cấp quyền hệ thống'] },
        { key: 'dateRange', label: 'Mức độ ưu tiên', value: 'Bình thường (SLA 24h)', type: 'text' },
        { key: 'reason', label: 'Mô tả chi tiết', value: 'Đề xuất cấp màn hình phụ 27 inch cho bàn làm việc khu B', type: 'text' },
      ],
    });
  }

  if (q.includes('soạn nháp') || q.includes('iwiki')) {
    return makeProposal({
      server: 'iWiki',
      tool: 'create_draft',
      title: 'Tạo bản nháp tài liệu iWiki',
      description: 'Lưu nháp tài liệu vào không gian team trên iWiki 4.0.',
      fields: [
        { key: 'title', label: 'Tiêu đề tài liệu', value: 'Quy trình chuẩn bị Pilot My iKame R1', type: 'text' },
        { key: 'dateRange', label: 'Không gian lưu', value: `iWiki / ${person.team}`, type: 'text' },
        { key: 'reason', label: 'Tóm tắt mở đầu', value: 'Checklist kiểm thử SSO, phân quyền audience và luồng xác nhận thông báo.', type: 'text' },
      ],
    });
  }

  if (q.includes('thông báo') || q.includes('xác nhận')) {
    const pendingPosts = posts.filter((p) => p.mandatoryAck && !p.ackedBy[person.id]);
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text:
        pendingPosts.length === 0
          ? 'Tuyệt vời! Bạn đã xác nhận đầy đủ tất cả thông báo bắt buộc hiện tại.'
          : `Bạn đang có **${pendingPosts.length} thông báo bắt buộc** chưa xác nhận:\n\n${pendingPosts
              .map((p) => `• **${p.title}** (${p.ackOverdue ? 'Quá hạn' : `Hạn ${p.ackDeadline}`})`)
              .join('\n')}\n\nBạn có thể mở mục iKame Feed hoặc Trang chủ để đọc và xác nhận ngay.`,
      sources: ['COM · Mandatory Ack', 'HRIS · get_pending_acks'],
    };
  }

  if (q.includes('sự kiện')) {
    const upcoming = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
    return {
      id,
      role: 'assistant',
      timestamp: nowStr,
      text: `Hiện có **${upcoming.length} sự kiện** nổi bật sắp diễn ra tại iKame:\n\n${upcoming
        .slice(0, 3)
        .map((e) => `• **${e.title}** — ${e.dateLabel} (${e.format}, ${e.location})`)
        .join('\n')}\n\nMở mục **Sự kiện** để đăng ký 1 chạm và thêm vào lịch (.ics).`,
      sources: ['My iKame Events', 'Google Calendar'],
    };
  }

  // Fallback helpful response
  return {
    id,
    role: 'assistant',
    timestamp: nowStr,
    text: `Tôi đã ghi nhận câu hỏi *"${prompt}"*. Hiện tại tôi có thể giúp bạn thực hiện nhanh các tác vụ qua **MCP chuẩn hoá iKame**:\n\n• **Tổng hợp việc hôm nay** (COM, iCheck, HRIS, iGoal, Asana, Lịch)\n• **Tạo đơn iCheck có duyệt:** Xin nghỉ phép, WFH, Quên chấm công, Đi muộn/Về sớm\n• **Tác vụ công việc:** Đặt phòng họp, Check-in OKR, Tạo ticket iRequest, Soạn nháp iWiki\n• **Tra cứu chính sách:** Hỏi quy định nghỉ phép, WFH, số dư phép năm`,
    sources: ['My iKame AI · MCP Router'],
  };
}
