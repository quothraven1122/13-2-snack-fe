import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type OrganizationBudgetCardProps = {
  title: string;
  budget: number;
  text: string;
  suffix?: ReactNode;
  tooltip?: ReactNode;
  className?: string;
};
export default function OrganizationBudgetCard({
  title,
  budget,
  text,
  suffix,
  tooltip,
  className,
}: OrganizationBudgetCardProps) {
  return (
    <div
      className={cn(
        'relative group min-h-[150px] p-[30px] bg-primary-50 rounded-[4px]',
        className,
      )}
    >
      <div className="flex flex-col gap-[10px] justify-between mb-[17px] lg:flex-row">
        <h2 className="text-18-bold">{title}</h2>
        <p className="text-24-extrabold">{budget.toLocaleString()}원</p>
      </div>
      <p className="text-16-regular text-primary-600 whitespace-pre-line">
        {text}
      </p>
      {suffix}
      {tooltip && (
        <div className="absolute left-[10%] top-[90%] z-20 hidden group-hover:block w-full max-w-[320px] p-[20px] bg-primary-950 text-white rounded-[12px] pointer-events-none ">
          {tooltip}
        </div>
      )}
    </div>
  );
}
