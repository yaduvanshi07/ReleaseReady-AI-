import React from 'react';
import { cn } from '../lib/utils';
import { ITEM_CATEGORIES, EVIDENCE_STATUSES, REVIEW_STATES, IMPACT_LEVELS } from '../lib/constants';

export function StatusBadge({ type, value, className }) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = value;

  if (type === 'category') {
    const found = ITEM_CATEGORIES.find(c => c.value === value);
    if (found) {
      badgeStyle = found.color;
      label = found.label;
    }
  } else if (type === 'evidenceStatus') {
    const found = EVIDENCE_STATUSES.find(s => s.value === value);
    if (found) {
      badgeStyle = found.color;
      label = found.label;
    }
  } else if (type === 'reviewState') {
    const found = REVIEW_STATES.find(r => r.value === value);
    if (found) {
      badgeStyle = found.color;
      label = found.label;
    }
  } else if (type === 'impact') {
    const found = IMPACT_LEVELS[value];
    if (found) {
      badgeStyle = found.color;
      label = `${value} Impact`;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
        badgeStyle,
        className
      )}
    >
      {label}
    </span>
  );
}
