/**
 * Registry MCP (mock) — hợp đồng tool mà Trợ lý AI của My iKame gọi tới các hệ thống nguồn.
 * Viết như hợp đồng thật để team AI Platform (MCP framework dùng chung) đọc được:
 * mỗi tool có server, scope read/write, và cần người duyệt hay không. Bản thật: framework
 * MCP của iKame cấp server thật, My iKame chỉ là client — không tự build intelligence.
 */
export type McpServerId = 'hris' | 'icheck' | 'igoal' | 'iwiki' | 'irequest' | 'asana' | 'calendar';
export type McpServerStatus = 'connected' | 'degraded' | 'offline';

export type McpTool = {
  /** `server.tool_name` — khoá dùng trong receipt/audit. */
  name: `${McpServerId}.${string}`;
  description: string;
  scope: 'read' | 'write';
  /** 'human' = agent đề xuất, người duyệt rồi mới gọi (spec D9: có audit). */
  approval: 'auto' | 'human';
  params: string[];
};

export type McpServer = { id: McpServerId; name: string; status: McpServerStatus; owner: string; tools: McpTool[] };

export const MCP_SERVERS: McpServer[] = [
  { id: 'hris', name: 'HRIS', status: 'connected', owner: 'P&OD', tools: [
    { name: 'hris.get_profile', description: 'Hồ sơ nhân sự, quản lý trực tiếp, đơn vị', scope: 'read', approval: 'auto', params: ['person_id'] },
    { name: 'hris.get_pending_acks', description: 'Thông báo chính sách chưa xác nhận', scope: 'read', approval: 'auto', params: ['person_id'] },
    { name: 'hris.acknowledge_policy', description: 'Ghi nhận đã đọc chính sách (audit)', scope: 'write', approval: 'human', params: ['person_id', 'policy_id'] },
    { name: 'hris.list_documents', description: 'Giấy tờ/hợp đồng và hạn', scope: 'read', approval: 'auto', params: ['person_id'] },
  ] },
  { id: 'icheck', name: 'iCheck', status: 'connected', owner: 'BM · Phú', tools: [
    { name: 'icheck.get_today_status', description: 'Trạng thái chấm công hôm nay', scope: 'read', approval: 'auto', params: ['person_id', 'date'] },
    { name: 'icheck.get_leave_balance', description: 'Số dư phép năm / phép hỉ', scope: 'read', approval: 'auto', params: ['person_id'] },
    { name: 'icheck.create_leave_request', description: 'Tạo đơn nghỉ phép gửi quản lý duyệt', scope: 'write', approval: 'human', params: ['person_id', 'from', 'to', 'type', 'reason'] },
    { name: 'icheck.create_wfh_request', description: 'Đăng ký làm việc từ xa', scope: 'write', approval: 'human', params: ['person_id', 'date', 'reason'] },
    { name: 'icheck.report_missing_checkin', description: 'Bổ sung chấm công quên', scope: 'write', approval: 'human', params: ['person_id', 'date', 'time', 'reason'] },
    { name: 'icheck.create_late_early_request', description: 'Xin đi muộn / về sớm', scope: 'write', approval: 'human', params: ['person_id', 'date', 'minutes', 'reason'] },
  ] },
  { id: 'igoal', name: 'iGoal', status: 'connected', owner: 'BM · Dũng', tools: [
    { name: 'igoal.get_my_objectives', description: 'Mục tiêu & trạng thái check-in', scope: 'read', approval: 'auto', params: ['person_id', 'period'] },
    { name: 'igoal.submit_checkin', description: 'Gửi báo cáo check-in', scope: 'write', approval: 'human', params: ['goal_id', 'progress', 'content'] },
  ] },
  { id: 'iwiki', name: 'iWiki', status: 'connected', owner: 'BM · Hưng', tools: [
    { name: 'iwiki.search', description: 'Tìm tài liệu theo quyền', scope: 'read', approval: 'auto', params: ['query', 'person_id'] },
    { name: 'iwiki.create_draft', description: 'Tạo bản nháp bài viết', scope: 'write', approval: 'human', params: ['title', 'blocks'] },
  ] },
  { id: 'irequest', name: 'iRequest', status: 'connected', owner: 'BM', tools: [
    { name: 'irequest.get_categories', description: 'Danh mục & SLA request', scope: 'read', approval: 'auto', params: [] },
    { name: 'irequest.create_ticket', description: 'Tạo request IT/HC/thiết bị', scope: 'write', approval: 'human', params: ['type', 'title', 'detail'] },
  ] },
  { id: 'asana', name: 'Asana', status: 'degraded', owner: 'IT Platform', tools: [
    { name: 'asana.list_my_tasks', description: 'Task được giao, hạn hôm nay', scope: 'read', approval: 'auto', params: ['person_id'] },
  ] },
  { id: 'calendar', name: 'Google Calendar', status: 'connected', owner: 'IT Platform', tools: [
    { name: 'calendar.list_events', description: 'Lịch họp trong ngày', scope: 'read', approval: 'auto', params: ['person_id', 'date'] },
    { name: 'calendar.find_free_room', description: 'Tìm phòng trống theo sức chứa', scope: 'read', approval: 'auto', params: ['start', 'end', 'capacity'] },
    { name: 'calendar.book_room', description: 'Giữ phòng + gửi lời mời', scope: 'write', approval: 'human', params: ['room', 'start', 'end', 'guests'] },
  ] },
];

const TOOL_INDEX = new Map(MCP_SERVERS.flatMap((server) => server.tools.map((tool) => [tool.name, { server, tool }] as const)));

export function findTool(name: string): { server: McpServer; tool: McpTool } | undefined {
  return TOOL_INDEX.get(name as McpTool['name']);
}

/** Nhãn ngắn cho chip nguồn: "iCheck" từ "icheck.create_leave_request". */
export function serverLabel(toolName: string): string {
  return findTool(toolName)?.server.name ?? toolName.split('.')[0];
}
