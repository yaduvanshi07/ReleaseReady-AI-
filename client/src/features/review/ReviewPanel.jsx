import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  Clock, 
  Save, 
  Undo, 
  ShieldAlert, 
  Tag, 
  FileText,
  History
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../lib/api';

export function ReviewPanel({ statements = [], onStatementUpdated, releaseItems = [], qaEvidence = [] }) {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [notes, setNotes] = useState('');
  const [inspectSourceCode, setInspectSourceCode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = (stmt) => {
    setEditingId(stmt.id);
    setEditContent(stmt.currentContent);
    setNotes('');
  };

  const handleSaveReview = async (statementId, reviewState, contentToSave = null) => {
    setIsSaving(true);
    try {
      const payload = {
        reviewState,
        currentContent: contentToSave !== null ? contentToSave : editContent,
        notes: notes || undefined
      };
      const res = await api.updateStatementReview(statementId, payload);
      if (onStatementUpdated) {
        onStatementUpdated(res.statement);
      }
      setEditingId(null);
    } catch (err) {
      alert(`Failed to save review decision: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const findSourceDetails = (code) => {
    if (code === 'QA-SUMMARY') {
      return { title: 'Release QA Summary', details: 'Full QA summary text.' };
    }
    const item = releaseItems.find(i => i.code === code);
    if (item) return { title: `[${item.code}] ${item.title}`, details: item.description, category: item.category };
    const ev = qaEvidence.find(e => e.code === code);
    if (ev) return { title: `[${ev.code}] ${ev.title}`, details: ev.details, status: ev.status };
    return null;
  };

  const staleCount = statements.filter(s => s.isStale).length;
  const acceptedCount = statements.filter(s => s.reviewState === 'accepted').length;
  const pendingCount = statements.filter(s => s.reviewState === 'generated' || s.reviewState === 'needs_review').length;

  return (
    <div className="space-y-6">
      {/* Review Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
          <span className="text-xs text-ink-muted">Total Statements</span>
          <p className="text-xl font-bold text-ink-primary mt-0.5">{statements.length}</p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
          <span className="text-xs text-emerald-700 font-medium">Accepted</span>
          <p className="text-xl font-bold text-emerald-800 mt-0.5">{acceptedCount}</p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
          <span className="text-xs text-amber-700 font-medium">Pending Review</span>
          <p className="text-xl font-bold text-amber-800 mt-0.5">{pendingCount}</p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-surface-border shadow-xs">
          <span className="text-xs text-red-700 font-medium">Flagged Stale</span>
          <p className="text-xl font-bold text-red-800 mt-0.5">{staleCount}</p>
        </div>
      </div>

      {staleCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Stale Generated Statements Detected</h4>
            <p className="mt-0.5 leading-relaxed">
              Source items or QA evidence referenced by {staleCount} statement(s) have been modified. 
              Review each statement below and choose to accept, edit, or regenerate.
            </p>
          </div>
        </div>
      )}

      {/* Statements List */}
      {statements.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-surface-border text-center text-xs text-ink-muted">
          No generated statements yet. Run AI analysis first to populate statements for review.
        </div>
      ) : (
        <div className="space-y-4">
          {statements.map((stmt) => {
            const isEditing = editingId === stmt.id;

            return (
              <div
                key={stmt.id}
                className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 transition-all ${
                  stmt.isStale
                    ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400/50'
                    : 'border-surface-border hover:border-slate-300'
                }`}
              >
                {/* Statement Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 px-2 py-0.5 bg-slate-100 rounded border">
                      {stmt.id}
                    </span>
                    <span className="text-xs font-semibold text-ink-secondary capitalize">
                      {stmt.statementType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {stmt.isStale && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>STALE SOURCE</span>
                      </span>
                    )}
                    <StatusBadge type="reviewState" value={stmt.reviewState} />
                  </div>
                </div>

                {stmt.isStale && stmt.staleReason && (
                  <p className="text-[11px] text-amber-800 font-medium bg-amber-100/70 p-2 rounded-md border border-amber-200">
                    ⚠️ {stmt.staleReason}
                  </p>
                )}

                {/* Statement Content */}
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full text-xs rounded-lg border border-saffron-400 p-2.5 focus:ring-2 focus:ring-saffron-500 font-medium"
                    />
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional review notes or change justification..."
                      className="w-full text-xs rounded-lg border border-surface-border p-2 focus:ring-2 focus:ring-saffron-500"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveReview(stmt.id, 'edited', editContent)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-saffron-600 hover:bg-saffron-700 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Edit</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm text-ink-primary leading-relaxed font-medium">
                      {stmt.currentContent}
                    </p>

                    {stmt.originalContent !== stmt.currentContent && (
                      <div className="mt-2 p-2 bg-slate-50 border rounded text-[11px] text-ink-muted">
                        <span className="font-semibold">Original Generated Text:</span> {stmt.originalContent}
                      </div>
                    )}
                  </div>
                )}

                {/* Supporting Source Citations */}
                {stmt.sourceIdentifiers && stmt.sourceIdentifiers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-ink-muted">Supporting Evidence:</span>
                    {stmt.sourceIdentifiers.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setInspectSourceCode(inspectSourceCode === code ? null : code)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 hover:bg-saffron-100 text-slate-800 hover:text-saffron-900 border border-slate-200 transition-colors cursor-pointer"
                        title="Click to inspect underlying source evidence"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{code}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Source Inspection Drawer */}
                {inspectSourceCode && stmt.sourceIdentifiers.includes(inspectSourceCode) && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-ink-primary">
                        Source Inspector: {findSourceDetails(inspectSourceCode)?.title || inspectSourceCode}
                      </strong>
                      <button
                        onClick={() => setInspectSourceCode(null)}
                        className="text-[10px] text-ink-muted hover:text-ink-primary"
                      >
                        Close
                      </button>
                    </div>
                    <p className="text-ink-secondary text-[11px]">
                      {findSourceDetails(inspectSourceCode)?.details || 'No additional source notes recorded.'}
                    </p>
                  </div>
                )}

                {/* Actions Bar */}
                {!isEditing && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(stmt)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Content</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isSaving || stmt.reviewState === 'rejected'}
                        onClick={() => handleSaveReview(stmt.id, 'rejected', stmt.currentContent)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSaving || stmt.reviewState === 'accepted'}
                        onClick={() => handleSaveReview(stmt.id, 'accepted', stmt.currentContent)}
                        className="inline-flex items-center gap-1 px-3.5 py-1 rounded-md text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{stmt.isStale ? 'Re-Approve (Stale Resolved)' : 'Accept Statement'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
