import type { ReactNode } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@coreds/react';
import { snoozeOptions, type SnoozeOption } from './task-utils';

/** Menu hoãn việc (bàn phím: Enter mở, mũi tên chọn, Esc đóng). `trigger` là nút bấm do nơi gọi dựng. */
export function SnoozeMenu({ trigger, onPick, now }: { trigger: ReactNode; onPick: (option: SnoozeOption) => void; now: Date }) {
  const options = snoozeOptions(now);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="snooze-menu">
        <DropdownMenuLabel>Hoãn việc này tới</DropdownMenuLabel>
        {options.filter((option) => option.key !== 'skip').map((option) => (
          <DropdownMenuItem key={option.key} onSelect={() => onPick(option)}>{option.label}</DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {options.filter((option) => option.key === 'skip').map((option) => (
          <DropdownMenuItem key={option.key} onSelect={() => onPick(option)}>Bỏ qua</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
