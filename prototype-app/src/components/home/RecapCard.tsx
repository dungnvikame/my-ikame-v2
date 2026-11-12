import { MoonStarsIcon as MoonStars } from '@coreds/react/icons';
import { TextButton } from '../UI';

export type RecapProps = {
  handled: number;
  total: number;
  meetingsPast: number;
  meetingsTotal: number;
  snoozedToTomorrow: number;
  /** Cuộc họp đầu tiên ngày mai, nếu biết. */
  tomorrowFirst?: string;
  onHide?: () => void;
};

/** "Tổng kết cuối ngày": hiện từ 16:30 hoặc khi người dùng bấm "Xem tổng kết". */
export function RecapCard({ handled, total, meetingsPast, meetingsTotal, snoozedToTomorrow, tomorrowFirst, onHide }: RecapProps) {
  const closing = handled >= total && total > 0
    ? 'Bạn đã xử lý hết việc hôm nay. Nghỉ ngơi thật tốt nhé.'
    : handled > 0
      ? 'Một ngày làm việc chắc tay. Phần còn lại cứ để sang mai.'
      : 'Hôm nay khá yên ắng. Mai bắt đầu nhẹ nhàng nhé.';
  const stats = [
    { value: `${handled}/${total}`, label: 'Việc đã xử lý' },
    { value: `${meetingsPast}/${meetingsTotal}`, label: 'Cuộc họp đã qua' },
    { value: String(snoozedToTomorrow), label: 'Việc hoãn sang mai' },
  ];
  return (
    <section className="recap" aria-labelledby="recap-title">
      <header>
        <h2 id="recap-title"><MoonStars size={20} variant="duotone" aria-hidden="true" />Tổng kết cuối ngày</h2>
        {onHide && <TextButton onClick={onHide}>Ẩn</TextButton>}
      </header>
      <dl className="recap-stats">
        {stats.map((stat) => (
          <div key={stat.label}><dd>{stat.value}</dd><dt>{stat.label}</dt></div>
        ))}
      </dl>
      <p className="recap-tomorrow">{tomorrowFirst ? `Việc đầu tiên ngày mai: ${tomorrowFirst}` : 'Ngày mai chưa có cuộc họp nào được xếp.'}</p>
      <p className="recap-closing">{closing}</p>
    </section>
  );
}
