import { SectionHeader } from '../../components/UI';
import { companyWeek } from '../../data/team-engagement';

/** Phân rã WAER theo loại hành động — COM thấy "hoạt động có nghĩa" đến từ đâu, không chỉ con số mở app. */
export function AdminWaerBreakdown() {
  return (
    <section className="admin-block admin-waer" aria-label="Phân rã WAER">
      <SectionHeader title="WAER theo loại hành động" meta={`${companyWeek.label} · % iKamer có ít nhất một hành động loại này · nguồn: event log My iKame`} />
      <ul className="admin-waer-list">
        {companyWeek.breakdown.map((row) => (
          <li key={row.key} className="admin-waer-row">
            <span className="admin-waer-label">{row.label}</span>
            <div className="admin-waer-bar" role="img" aria-label={`${row.label}: ${row.percent}%`}>
              <div className="admin-waer-bar-fill" style={{ width: `${row.percent}%` }} />
            </div>
            <strong className="admin-waer-value">{row.percent}%</strong>
          </li>
        ))}
      </ul>
      <p className="inline-guidance">North Star đề xuất từ T11: WAER thay WAU — mở app không còn là mục tiêu, hành động có nghĩa mới là.</p>
    </section>
  );
}
