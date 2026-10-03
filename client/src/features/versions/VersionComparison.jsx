import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, PlusCircle, MinusCircle, RefreshCw, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { api } from '../../lib/api';

export function VersionComparison({ releaseId, snapshots = [], defaultBaseId = null, defaultTargetId = null }) {
  const [baseId, setBaseId] = useState(defaultBaseId || (snapshots[1]?.id || (snapshots[0]?.id || 'current')));
  const [targetId, setTargetId] = useState(defaultTargetId || 'current');
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComparison = async () => {
    if (!baseId || !targetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.compareVersions(releaseId, baseId, targetId);
      setComparison(res.comparison);
    } catch (err) {
      setError(err.message || 'Failed to compare snapshots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [baseId, targetId, releaseId]);

  return (
    <div className="space-y-6">
      {/* Comparison Selectors */}
      <div className="p-5 bg-white rounded-xl border border-surface-border shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-saffron-600" />
          <span>Deterministic Snapshot Comparison</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              Base Snapshot (Earlier)
            </label>
            <select
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-surface-border p-2.5 bg-surface-subtle"
            >
              <option value="current">Current Active Package</option>
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>
                  {s.versionLabel} ({new Date(s.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              Target Snapshot (Later)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-surface-border p-2.5 bg-surface-subtle"
            >
              <option value="current">Current Active Package</option>
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>
                  {s.versionLabel} ({new Date(s.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 bg-white rounded-xl border text-center text-xs text-ink-muted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-saffron-600" />
          <span>Computing deterministic diff...</span>
        </div>
      ) : comparison ? (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
              <span className="text-xs text-emerald-700 font-semibold">+ Added Items</span>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{comparison.itemDiff.summary.addedCount}</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
              <span className="text-xs text-red-700 font-semibold">- Removed Items</span>
              <p className="text-xl font-bold text-red-800 mt-0.5">{comparison.itemDiff.summary.removedCount}</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
              <span className="text-xs text-amber-700 font-semibold">~ Modified Items</span>
              <p className="text-xl font-bold text-amber-800 mt-0.5">{comparison.itemDiff.summary.modifiedCount}</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
              <span className="text-xs text-slate-600 font-semibold">= Unchanged</span>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{comparison.itemDiff.summary.unchangedCount}</p>
            </div>
          </div>

          {/* Added Items Section */}
          {comparison.itemDiff.added.length > 0 && (
            <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Newly Added Release Items ({comparison.itemDiff.added.length})</span>
              </h4>
              <div className="space-y-2">
                {comparison.itemDiff.added.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                        {item.code || `Item ${idx + 1}`}
                      </span>
                      <span className="font-semibold text-emerald-900">{item.title}</span>
                      <span className="text-[10px] text-emerald-700 font-medium capitalize">({item.category})</span>
                    </div>
                    {item.description && <p className="text-emerald-800/80">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modified Items Section */}
          {comparison.itemDiff.modified.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Modified Release Items ({comparison.itemDiff.modified.length})</span>
              </h4>
              <div className="space-y-2.5">
                {comparison.itemDiff.modified.map((mod, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] bg-white px-1.5 py-0.5 rounded border border-amber-300">
                        {mod.item.code || mod.key}
                      </span>
                      <span className="font-semibold text-amber-900">{mod.item.title}</span>
                    </div>

                    <div className="space-y-1 pl-2 border-l-2 border-amber-300">
                      {mod.changes.map((ch, cIdx) => (
                        <div key={cIdx} className="text-[11px] text-ink-secondary">
                          <strong className="text-amber-900 capitalize">{ch.field}:</strong>{' '}
                          <span className="line-through text-red-600">{ch.from || '(empty)'}</span> →{' '}
                          <span className="text-emerald-700 font-semibold">{ch.to || '(empty)'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed Items Section */}
          {comparison.itemDiff.removed.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-red-600" />
                <span>Removed Release Items ({comparison.itemDiff.removed.length})</span>
              </h4>
              <div className="space-y-2">
                {comparison.itemDiff.removed.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-red-50/60 border border-red-200 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] bg-white px-1.5 py-0.5 rounded border border-red-300">
                        {item.code || `Item ${idx + 1}`}
                      </span>
                      <span className="font-semibold text-red-900 line-through">{item.title}</span>
                      <span className="text-[10px] text-red-700 font-medium capitalize">({item.category})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QA Evidence Diff Section */}
          <div className="bg-white rounded-xl border border-surface-border p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-saffron-600" />
              <span>QA Evidence Differences</span>
            </h4>
            <div className="flex gap-4 text-xs text-ink-secondary">
              <span>Added: <strong>{comparison.evidenceDiff.summary.addedCount}</strong></span>
              <span>Modified: <strong>{comparison.evidenceDiff.summary.modifiedCount}</strong></span>
              <span>Removed: <strong>{comparison.evidenceDiff.summary.removedCount}</strong></span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
