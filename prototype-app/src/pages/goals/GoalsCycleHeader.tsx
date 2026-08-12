import { ArrowSquareOut } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Button } from '../../components/UI';
import { CYCLE_OPTIONS, type CycleOption } from './build-okr-tree';

type GoalsCycleHeaderProps = {
  eyebrow: string;
  title: string;
  cycle: CycleOption;
  onCycleChange: (cycle: CycleOption) => void;
  children?: ReactNode;
};

/** Shared page-heading + cycle selector — same segmented pattern for both perspectives (DRY). */
export function GoalsCycleHeader({ eyebrow, title, cycle, onCycleChange, children }: GoalsCycleHeaderProps) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {children}
      </div>
      <div className="okr-header-actions">
        <div className="okr-cycle-selector" role="group" aria-label="Chọn chu kỳ">
          {CYCLE_OPTIONS.map((option) => (
            <button key={option} type="button" className={option === cycle ? 'is-active' : ''} aria-pressed={option === cycle} onClick={() => onCycleChange(option)}>
              {option}
            </button>
          ))}
        </div>
        <Button variant="borderless" icon={<ArrowSquareOut size={17} />} title="Demo — sẽ deep-link sang hệ thống nguồn">Cấu hình trong iGoal</Button>
      </div>
    </header>
  );
}
