import { Desktop, Key, Target } from '@phosphor-icons/react';
import { PlatformHandoffButton } from '../../components/PlatformHandoff';
import { EmptyState, SectionHeader, StatusPill } from '../../components/UI';
import { LIVE_SOURCES, type LiveData, type LiveSourceId } from '../../lib/live/live-data';

/**
 * Trang Cá nhân khi đã nối dữ liệu thật (bản artifact). Nguyên tắc: chỉ hiện thứ đọc được từ
 * công cụ thật; phần chưa có nguồn (hồ sơ HRIS, lương, hợp đồng, thâm niên) ghi rõ là chưa nối
 * thay vì hiện số của nhân vật mẫu.
 */
const timeLabel = (date: Date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

/** Dòng chân mỗi khối: nguồn + thời điểm đọc, để người xem biết số liệu đến từ đâu. */
function SourceNote({ source, live }: { source: LiveSourceId; live: LiveData }) {
  return <p className="live-source">Nguồn: {LIVE_SOURCES[source].label} · đọc lúc {timeLabel(live.loadedAt)}</p>;
}

/** Khối thay thế khi một nguồn không đọc được — không để trống, không bịa số. */
function SourceUnavailable({ source, title }: { source: LiveSourceId; title: string }) {
  return (
    <section className="side-info profile-section">
      <SectionHeader title={title} />
      <p className="live-source">Chưa đọc được {LIVE_SOURCES[source].label}. Bấm Tải lại trên Trang chủ để thử lại.</p>
    </section>
  );
}

export function LiveProfileHero({ live }: { live: LiveData }) {
  const { person, icheck, objectives, devices, licenses } = live;
  return (
    <section className="profile-hero" aria-label="Thông tin cá nhân">
      <div className="profile-cover" aria-hidden="true" />
      <div className="profile-identity">
        <span className="profile-avatar" aria-hidden="true">{person.shortName.slice(0, 1)}</span>
        <div className="profile-identity-main">
          <div className="profile-identity-name">
            <h1>{person.name}</h1>
            <StatusPill tone="success">Dữ liệu thật</StatusPill>
          </div>
          <p className="profile-identity-role">{[person.position, person.team].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <div className="profile-stats" role="list">
        <div role="listitem">
          <strong>{objectives ? `${objectives.length} mục tiêu` : '—'}</strong>
          <small>Kỳ {live.igoal?.period ?? 'hiện tại'}</small>
        </div>
        <div role="listitem">
          <strong>{icheck ? `${icheck.leave.total.toLocaleString('vi-VN')} ngày` : '—'}</strong>
          <small>Phép còn lại</small>
        </div>
        <div role="listitem">
          <strong>{devices ? `${devices.length} thiết bị` : '—'}</strong>
          <small>Đang được cấp</small>
        </div>
        <div role="listitem">
          <strong>{licenses ? `${licenses.length} license` : '—'}</strong>
          <small>Đang dùng</small>
        </div>
      </div>
    </section>
  );
}

function GoalsSection({ live }: { live: LiveData }) {
  const objectives = live.objectives;
  if (!objectives) return <SourceUnavailable source="igoal" title="Mục tiêu của tôi" />;
  return (
    <section className="side-info profile-section" aria-label="Mục tiêu của tôi">
      <SectionHeader title="Mục tiêu của tôi" meta={`${objectives.length} mục tiêu · kỳ ${live.igoal?.period ?? ''}`} />
      {objectives.length === 0 ? (
        <EmptyState icon={<Target size={44} weight="duotone" />} title="Chưa có mục tiêu trong kỳ này" body="Mục tiêu bạn sở hữu trên iGoal sẽ hiện ở đây." />
      ) : (
        <div className="live-objectives">
          {objectives.map((objective) => (
            <article key={objective.id} className="live-objective">
              <header>
                <div>
                  {objective.scope && <small>{objective.scope}</small>}
                  <h3>{objective.title}</h3>
                </div>
                <strong className="live-progress-value">{Math.round(objective.progress)}%</strong>
              </header>
              <ul>
                {objective.keyResults.map((kr) => {
                  const percent = kr.target > 0 ? Math.min(100, Math.round((kr.current / kr.target) * 100)) : 0;
                  return (
                    <li key={kr.id}>
                      <p>{kr.title}</p>
                      <div className="live-kr-meter">
                        <div className="live-kr-track" role="img" aria-label={`Tiến độ ${percent}%`}><span style={{ width: `${percent}%` }} /></div>
                        <span>{percent}%</span>
                        {kr.weight > 0 && <small>Trọng số {kr.weight}%</small>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
      <div className="live-section-foot">
        <SourceNote source="igoal" live={live} />
        <PlatformHandoffButton platform="iGoal" action="cập nhật tiến độ mục tiêu" label="Mở iGoal" variant="link" />
      </div>
    </section>
  );
}

function ReportSection({ live }: { live: LiveData }) {
  const weekly = live.igoal?.weekly;
  if (!weekly) return null;
  return (
    <section className="side-info profile-section" aria-label="Báo cáo tuần">
      <SectionHeader title="Báo cáo tuần" />
      <p className="live-fact">
        <strong>{weekly.latestTitle ?? 'Chưa có báo cáo trong kỳ này'}</strong>
        {weekly.latestTitle && <span>{weekly.managerResponded ? 'Quản lý đã phản hồi' : 'Quản lý chưa phản hồi'}</span>}
      </p>
      <p className="live-source">{weekly.writtenThisWeek ? 'Tuần này bạn đã viết báo cáo.' : 'Tuần này bạn chưa viết báo cáo.'}</p>
      <SourceNote source="igoal" live={live} />
    </section>
  );
}

function OrgSection({ live }: { live: LiveData }) {
  return (
    <section className="side-info profile-section" aria-label="Tổ chức">
      <SectionHeader title="Tổ chức" />
      <dl className="live-facts">
        <div><dt>Đơn vị</dt><dd>{live.person.team || '—'}</dd></div>
        <div><dt>Chức danh</dt><dd>{live.person.position || '—'}</dd></div>
        <div><dt>Quản lý trực tiếp</dt><dd>{live.igoal?.managerName || '—'}</dd></div>
      </dl>
      <SourceNote source="igoal" live={live} />
    </section>
  );
}

function AttendanceSection({ live }: { live: LiveData }) {
  const icheck = live.icheck;
  if (!icheck) return <SourceUnavailable source="icheck" title="Chấm công và phép" />;
  const { leave, month, checkIn } = icheck;
  return (
    <section className="side-info profile-section" aria-label="Chấm công và phép">
      <SectionHeader title="Chấm công và phép" />
      <dl className="live-facts">
        <div><dt>Hôm nay</dt><dd>{checkIn.done ? `Đã chấm ${checkIn.timeLabel}${checkIn.status === 'late' ? ' (muộn)' : ''}` : 'Chưa chấm công'}</dd></div>
        <div><dt>Tháng này</dt><dd>{month.checkedDays} buổi đã chấm · {month.lateDays} buổi muộn</dd></div>
        <div><dt>Phép còn lại</dt><dd>{leave.total.toLocaleString('vi-VN')} ngày (năm cũ {leave.carriedOver.toLocaleString('vi-VN')})</dd></div>
        <div><dt>Đã dùng năm nay</dt><dd>{leave.annualUsed.toLocaleString('vi-VN')} / {leave.annualQuota.toLocaleString('vi-VN')} ngày</dd></div>
      </dl>
      <div className="live-section-foot">
        <SourceNote source="icheck" live={live} />
        <PlatformHandoffButton platform="iCheck" action="xem lịch chấm công và lịch sử nghỉ phép" label="Mở iCheck" variant="link" />
      </div>
    </section>
  );
}

function DevicesSection({ live }: { live: LiveData }) {
  const { devices, licenses } = live;
  if (!devices || !licenses) return <SourceUnavailable source="itp" title="Thiết bị và license" />;
  return (
    <section className="side-info profile-section" aria-label="Thiết bị và license">
      <SectionHeader title="Thiết bị được cấp" meta={`${devices.length} thiết bị`} />
      {devices.length === 0 ? <p className="live-source">Bạn chưa được cấp thiết bị nào.</p> : (
        <ul className="profile-equipment-list">
          {devices.map((device) => (
            <li key={device.id}>
              <span className="profile-equipment-icon" aria-hidden="true"><Desktop size={18} /></span>
              <div>
                <strong>{device.name}</strong>
                <small>{[device.category, device.code].filter(Boolean).join(' · ')}</small>
                <span className="profile-equipment-meta">
                  {device.allocatedLabel && `Cấp ngày ${device.allocatedLabel}`}
                  {device.health !== undefined && ` · tình trạng ${device.health}/100`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <SectionHeader title="License đang dùng" meta={`${licenses.length} license`} />
      {licenses.length === 0 ? <p className="live-source">Bạn chưa có license nào.</p> : (
        <ul className="live-licenses">
          {licenses.map((license) => (
            <li key={license.id}><Key size={15} aria-hidden="true" /><strong>{license.name}</strong><small>{license.kind}</small></li>
          ))}
        </ul>
      )}
      <SourceNote source="itp" live={live} />
    </section>
  );
}

export function LiveProfileGrid({ live }: { live: LiveData }) {
  return (
    <div className="profile-grid">
      <div className="profile-main">
        <GoalsSection live={live} />
        <ReportSection live={live} />
        <section className="side-info profile-section" aria-label="Hồ sơ nhân sự">
          <SectionHeader title="Hồ sơ nhân sự" />
          <p className="live-source">
            Ngày vào làm, hợp đồng, lương, giấy tờ và cột mốc thâm niên lấy từ HRIS. My iKame chưa nối HRIS nên phần này để trống,
            không hiển thị số liệu mẫu.
          </p>
        </section>
      </div>
      <aside className="profile-rail">
        <OrgSection live={live} />
        <AttendanceSection live={live} />
        <DevicesSection live={live} />
      </aside>
    </div>
  );
}
