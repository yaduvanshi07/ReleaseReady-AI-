import React from 'react';
import { Plus, Trash2, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES } from '../../lib/constants';

export function QAEvidenceEditor({ evidence = [], onChange }) {
  const handleAddEvidence = () => {
    const nextNum = evidence.length + 1;
    const newEv = {
      id: `tmp_ev_${Date.now()}_${Math.random()}`,
      code: `QA-${String(nextNum).padStart(3, '0')}`,
      type: 'test_suite',
      title: '',
      details: '',
      status: 'passed'
    };
    onChange([...evidence, newEv]);
  };

  const handleUpdate = (index, field, value) => {
    const updated = [...evidence];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = evidence.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-saffron-600" />
          <h4 className="text-sm font-semibold text-ink-primary">Structured QA Evidence Records</h4>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {evidence.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddEvidence}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-saffron-800 bg-saffron-50 hover:bg-saffron-100 border border-saffron-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add QA Evidence</span>
        </button>
      </div>

      {evidence.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-surface-border text-center bg-surface-subtle">
          <p className="text-xs text-ink-muted">No structured QA evidence records added yet.</p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            * Deterministic validation requires at least 1 QA evidence record.
          </p>
          <button
            type="button"
            onClick={handleAddEvidence}
            className="mt-2 text-xs font-semibold text-saffron-700 hover:text-saffron-800"
          >
            + Add first QA evidence
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map((ev, idx) => (
            <div
              key={ev.id || ev.code || idx}
              className="p-3.5 rounded-lg border border-surface-border bg-white shadow-xs space-y-2.5 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shrink-0">
                  {ev.code || `QA-${String(idx + 1).padStart(3, '0')}`}
                </div>

                <select
                  value={ev.type}
                  onChange={(e) => handleUpdate(idx, 'type', e.target.value)}
                  className="text-xs rounded-md border border-surface-border px-2 py-1 bg-surface-subtle text-ink-secondary focus:ring-1 focus:ring-saffron-500 font-medium"
                >
                  {EVIDENCE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                <select
                  value={ev.status}
                  onChange={(e) => handleUpdate(idx, 'status', e.target.value)}
                  className="text-xs rounded-md border border-surface-border px-2 py-1 bg-surface-subtle text-ink-secondary focus:ring-1 focus:ring-saffron-500 font-medium"
                >
                  {EVIDENCE_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={ev.title}
                  onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                  placeholder="Evidence title (e.g. Stripe 3DS2 Automated E2E Suite)..."
                  className="flex-1 min-w-[200px] text-xs sm:text-sm font-medium rounded-md border border-surface-border px-2.5 py-1.5 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove evidence"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={ev.details}
                onChange={(e) => handleUpdate(idx, 'details', e.target.value)}
                placeholder="Execution details, test counts, coverage, benchmarks, or pass/fail observations..."
                rows={2}
                className="w-full text-xs rounded-md border border-surface-border px-2.5 py-1.5 text-ink-secondary placeholder:text-slate-400 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                required
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
