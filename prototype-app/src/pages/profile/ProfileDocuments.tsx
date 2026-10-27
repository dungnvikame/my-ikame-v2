import { ArrowRight, FileText, IdentificationCard, GraduationCap, ShieldCheck, FirstAidKit } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PlatformHandoffButton } from '../../components/PlatformHandoff';
import { SectionHeader, StatusPill } from '../../components/UI';
import type { PersonalDocument } from '../../types';

const KIND_ICON = { contract: FileText, identity: IdentificationCard, degree: GraduationCap, policy: ShieldCheck, insurance: FirstAidKit } as const;

const STATUS_META: Record<PersonalDocument['status'], { label: string; tone: 'success' | 'warning' | 'error' | 'neutral' }> = {
  valid: { label: 'Đầy đủ', tone: 'success' },
  expiring: { label: 'Sắp hết hạn', tone: 'warning' },
  expired: { label: 'Đã hết hạn', tone: 'error' },
  missing: { label: 'Còn thiếu', tone: 'error' },
};

/** Giấy tờ & hợp đồng — trách nhiệm cá nhân có hạn: đỏ ≤30 ngày, vàng ≤90, hành động rõ. */
export function ProfileDocuments({ documents }: { documents: PersonalDocument[] }) {
  const attention = documents.filter((doc) => doc.status !== 'valid').length;
  return (
    <section className="side-info profile-section" aria-label="Giấy tờ và hợp đồng">
      <SectionHeader title="Giấy tờ & hợp đồng" meta={attention ? `${attention} mục cần xử lý` : 'Hồ sơ đầy đủ'} />
      <ul className="profile-doc-list">
        {documents.map((doc) => {
          const Icon = KIND_ICON[doc.kind];
          const urgent = doc.status === 'missing' || doc.status === 'expired' || (doc.dueInDays ?? 99) <= 30;
          const tone = doc.status === 'expiring' && !urgent ? 'warning' : STATUS_META[doc.status].tone;
          return (
            <li key={doc.id} className={`profile-doc ${urgent ? 'is-urgent' : ''}`}>
              <span className="profile-doc-icon" aria-hidden="true"><Icon size={18} /></span>
              <div className="profile-doc-copy">
                <strong>{doc.name}</strong>
                <small>{doc.note}{doc.dueLabel ? ` · ${doc.dueLabel}` : ''}</small>
              </div>
              <StatusPill tone={urgent && doc.status === 'expiring' ? 'error' : tone}>{STATUS_META[doc.status].label}{doc.dueInDays != null ? ` · ${doc.dueInDays} ngày` : ''}</StatusPill>
              {doc.action === 'submit' && (
                <Link className="text-link" to={`/assistant?q=${encodeURIComponent(`Tạo request nhân sự: nộp bổ sung ${doc.name}`)}`}>Nộp bổ sung<ArrowRight size={14} /></Link>
              )}
              {doc.action === 'renew' && (
                <PlatformHandoffButton platform="iHRM" action={`gia hạn ${doc.name}`} label="Gia hạn" variant="link" />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
