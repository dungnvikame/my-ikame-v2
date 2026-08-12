import type { EventAgendaItem } from '../../types';
import { ParticipantAvatars } from './EventCardV2';

/** Rail-style agenda timeline — hidden entirely when the event has no `agenda`. */
export function EventAgenda({ agenda }: { agenda?: EventAgendaItem[] }) {
  if (!agenda || agenda.length === 0) return null;
  return (
    <section className="article-body events-v2-agenda">
      <h2>Chương trình</h2>
      <ol className="events-v2-agenda-rail">
        {agenda.map((item, index) => (
          <li key={`${item.time}-${index}`}>
            <span className="events-v2-agenda-time">{item.time}</span>
            <div className="events-v2-agenda-copy">
              <strong>{item.title}</strong>
              {item.speaker && <small>{item.speaker}</small>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Avatar grid + count — hidden when the event has no `participantNames`. */
export function EventParticipants({ names }: { names?: string[] }) {
  if (!names || names.length === 0) return null;
  return (
    <section className="article-body events-v2-participants">
      <h2>Người tham gia</h2>
      <ParticipantAvatars names={names} max={names.length} />
      <p className="muted-text">{names.length} người đã đăng ký</p>
    </section>
  );
}
