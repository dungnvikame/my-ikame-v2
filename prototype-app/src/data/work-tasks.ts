import { addDays, ymd, todayYmd } from './work-dates';

export type Subtask = { id: string; title: string; done: boolean };

export type WorkTask = {
  id: string;
  title: string;
  project: string;
  /** Hạn 'YYYY-MM-DD', không có = chưa đặt hạn. */
  due?: string;
  notes?: string;
  subtasks: Subtask[];
  done: boolean;
  /** Ngày hoàn thành 'YYYY-MM-DD'. */
  doneAt?: string;
  /** Giờ đã đặt 'YYYY-MM-DDTHH:MM'. */
  scheduledAt?: string;
};

export const WORK_TASKS_KEY = 'my-ikame-work-tasks';

export const DEFAULT_PROJECTS = ['My iKame', 'Core DS', 'Tối ưu onboarding', 'Nghiên cứu người dùng'];

const sub = (id: string, title: string, done = false): Subtask => ({ id, title, done });

/** Việc mẫu của một Product Designer, hạn tính theo hôm nay để demo luôn có quá hạn / sắp tới. */
export function seedTasks(): WorkTask[] {
  const t = todayYmd();
  const d = (n: number) => addDays(t, n);
  return [
    { id: 't1', title: 'Chốt thiết kế màn Lịch cho My iKame', project: 'My iKame', due: d(-3), notes: 'Cần PM xác nhận phần đặt phòng nhanh trước khi bàn giao dev.', subtasks: [sub('s1', 'Rà soát trạng thái trống/lỗi', true), sub('s2', 'Cập nhật mobile 375px'), sub('s3', 'Gửi dev review')], done: false },
    { id: 't2', title: 'Viết spec token màu cho dark mode', project: 'Core DS', due: d(-1), subtasks: [], done: false },
    { id: 't3', title: 'Review pull request component Drawer', project: 'Core DS', due: d(0), notes: 'Kiểm tra focus trap và đóng bằng Esc.', subtasks: [], done: false },
    { id: 't4', title: 'Chuẩn bị prototype test onboarding vòng 2', project: 'Tối ưu onboarding', due: d(1), subtasks: [sub('s4', 'Dựng luồng 5 màn'), sub('s5', 'Soạn kịch bản hỏi'), sub('s6', 'Chốt 5 người tham gia')], done: false },
    { id: 't5', title: 'Tổng hợp ghi chú phỏng vấn người dùng đợt 3', project: 'Nghiên cứu người dùng', due: d(2), subtasks: [], done: false },
    { id: 't6', title: 'Cập nhật thư viện icon sang Phosphor', project: 'Core DS', due: d(4), subtasks: [sub('s7', 'Liệt kê icon cũ'), sub('s8', 'Map sang tên mới')], done: false },
    { id: 't7', title: 'Thiết kế empty state cho trang Công việc', project: 'My iKame', due: d(6), subtasks: [], done: false },
    { id: 't8', title: 'Lên kế hoạch workshop design critique quý 1', project: 'Core DS', due: d(12), subtasks: [], done: false },
    { id: 't9', title: 'Đọc tài liệu hướng dẫn MCP của iKame', project: 'My iKame', subtasks: [], done: false },
    { id: 't10', title: 'Gom ý tưởng cải thiện checklist ngày đầu', project: 'Tối ưu onboarding', subtasks: [], done: false },
    { id: 't11', title: 'Dọn thư mục Figma cũ của dự án', project: 'Nghiên cứu người dùng', subtasks: [], done: false },
    { id: 't12', title: 'Gửi bản tóm tắt kết quả khảo sát NPS', project: 'Nghiên cứu người dùng', due: d(-1), subtasks: [], done: true, doneAt: d(-1) },
    { id: 't13', title: 'Đồng bộ biến typography với dev', project: 'Core DS', due: d(-2), subtasks: [], done: true, doneAt: d(-2) },
    { id: 't14', title: 'Vẽ lại luồng đăng nhập', project: 'My iKame', due: d(-4), subtasks: [], done: true, doneAt: d(-4) },
    { id: 't15', title: 'Báo cáo tiến độ tuần trước', project: 'My iKame', due: d(-5), subtasks: [], done: true, doneAt: d(-5) },
  ];
}

export function loadTasks(): WorkTask[] {
  try {
    const raw = localStorage.getItem(WORK_TASKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed as WorkTask[];
    }
  } catch { /* bỏ qua, dùng dữ liệu mẫu */ }
  return seedTasks();
}

export function saveTasks(tasks: WorkTask[]) {
  try { localStorage.setItem(WORK_TASKS_KEY, JSON.stringify(tasks)); } catch { /* bỏ qua */ }
}

export const newId = () => `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export { ymd };
