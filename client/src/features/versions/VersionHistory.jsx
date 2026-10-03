import React, { useState } from 'react';
import { Camera, GitBranch, Calendar, Clock, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';

export function VersionHistory({ releaseId, snapshots = [], onSnapshotCreated, onSelectForCompare }) {
  const [showModal, setShowModal] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [changelogSummary, setChangelogSummary] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!versionLabel.trim()) return;
    setIsCreating(true);
    setError(null);

    try {
      const res = await api.createSnapshot(releaseId, {
        versionLabel: versionLabel.trim(),
        changelogSummary: changelogSummary.trim()
      });
      setShowModal(false);
      setVersionLabel('');
      setChangelogSummary('');
      if (onSnapshotCreated) {
        onSnapshotCreated(res.snapshot);
      }
    } catch (err) {
      setError(err.message || 'Failed to create snapshot.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-surface-border shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-saffron-600" />
            <span>Immutable Release Snapshots</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Preserves frozen historical points of the release package, evidence, AI analyses, and human review decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-saffron-600 hover:bg-saffron-700 shadow-sm transition-colors cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Create Version Snapshot</span>
        </button>
      </div>

      {/* Snapshots List */}
      {snapshots.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-surface-border text-center text-xs text-ink-muted">
          No snapshots saved yet. Create a version snapshot to preserve this release state.
        </div>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snap, idx) => (
            <div
              key={snap.id}
              className="p-4 bg-white rounded-xl border border-surface-border shadow-xs flex flex-wrap items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-saffron-50 text-saffron-900 border border-saffron-200">
                    {snap.versionLabel}
                  </span>
                  <span className="text-xs text-ink-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTime(snap.createdAt)}</span>
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  {snap.changelogSummary || 'No snapshot change notes specified.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectForCompare && onSelectForCompare(snap.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                  <span>Compare Diff</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snapshot Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-surface-border max-w-md w-full p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                <Camera className="w-5 h-5 text-saffron-600" />
                <span>Create Immutable Snapshot</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Snapshot Version Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="e.g. v2.4.0-rc1"
                  className="w-full text-xs font-mono rounded-lg border border-surface-border p-2.5 focus:ring-2 focus:ring-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Changelog Summary / Snapshot Notes
                </label>
                <textarea
                  value={changelogSummary}
                  onChange={(e) => setChangelogSummary(e.target.value)}
                  placeholder="Summary of changes included in this version milestone..."
                  rows={3}
                  className="w-full text-xs rounded-lg border border-surface-border p-2.5 focus:ring-2 focus:ring-saffron-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-saffron-600 hover:bg-saffron-700 disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isCreating ? 'Creating Snapshot...' : 'Save Snapshot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
