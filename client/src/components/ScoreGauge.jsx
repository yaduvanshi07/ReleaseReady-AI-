import React from 'react';
import { cn } from '../lib/utils';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export function ScoreGauge({ score = 0, isReady = false, size = 'md', showIcon = true }) {
  let colorClass = 'text-status-error stroke-red-500';
  let bgClass = 'bg-red-50 border-red-200 text-red-700';
  let label = 'Not Ready';
  let Icon = ShieldAlert;

  if (score >= 80 && isReady) {
    colorClass = 'text-status-success stroke-emerald-600';
    bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-700';
    label = 'Ready for Release';
    Icon = ShieldCheck;
  } else if (score >= 50) {
    colorClass = 'text-saffron-600 stroke-amber-500';
    bgClass = 'bg-amber-50 border-amber-200 text-amber-800';
    label = 'Needs Review / Gaps';
    Icon = AlertTriangle;
  }

  if (size === 'sm') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold', bgClass)}>
        {showIcon && <Icon className="w-3.5 h-3.5" />}
        <span>{score}% — {label}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border bg-white shadow-soft', bgClass)}>
      {showIcon && (
        <div className="p-2 rounded-full bg-white shadow-sm border border-slate-200/80">
          <Icon className={cn('w-5 h-5', colorClass)} />
        </div>
      )}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight">{score}%</span>
          <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-xs text-ink-muted mt-0.5">
          {isReady ? 'All deterministic readiness criteria verified.' : 'Resolve missing required fields and QA checks.'}
        </p>
      </div>
    </div>
  );
}
