import { MagnifyingGlassIcon as MagnifyingGlass } from '@coreds/react/icons';
import { Input } from '@coreds/react';
import { ChipButton } from '../../components/UI';

const CHIP_COLORS = ['blue', 'violet', 'teal', 'orange', 'pink'] as const;

type KnowledgeHeroProps = {
  greetingName: string;
  term: string;
  onTermChange: (value: string) => void;
  topics: string[];
  activeTopic: string | null;
  onToggleTopic: (topic: string) => void;
};

export function KnowledgeHero({ greetingName, term, onTermChange, topics, activeTopic, onToggleTopic }: KnowledgeHeroProps) {
  return (
    <section className="khub-hero">
      <span className="khub-eyebrow">TRI THỨC</span>
      <h1>Chào {greetingName}, bạn muốn học gì hôm nay?</h1>
      <p className="khub-hero-sub">Tìm nhanh quy trình, chính sách và tài liệu từ iWiki — đúng theo quyền truy cập của bạn.</p>

      <div className="khub-hero-search-ds">
        <Input
          size="l"
          variant="light"
          leftIcon={<MagnifyingGlass size={20} />}
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          aria-label="Tìm tài liệu tri thức"
          placeholder="Tìm theo tên, chủ đề, nội dung..."
        />
      </div>

      {topics.length > 0 && (
        <div className="khub-chip-row" role="group" aria-label="Lọc theo chủ đề">
          {topics.map((topic, index) => (
            <ChipButton
              key={topic}
              aria-pressed={activeTopic === topic}
              onClick={() => onToggleTopic(topic)}
            >
              {topic}
            </ChipButton>
          ))}
        </div>
      )}
    </section>
  );
}
