import React, { useState } from 'react';
import {
  Microscope,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Tag,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { ITEM_CATEGORIES } from '../../lib/constants';

/**
 * Evidence Explorer
 * Given a list of generated statements, release items, and QA evidence,
 * allows the user to select a statement and inspect all supporting
 * source records, evidence assessments, and warnings.
 */
export function EvidenceExplorer({ statements = [], releaseItems = [], qaEvidence = [], qaAnalysis = [] }) {
  const [selectedStmtId, setSelectedStmtId] = useState(null);
  const [openSourceCode, setOpenSourceCode] = useState(null);

  const selectedStmt = statements.find(s => s.id === selectedStmtId);

  /**
   * Given a code like REL-001 or QA-001, find the source record.
   */
  function findSourceRecord(code) {
    if (!code) return null;
    const upperCode = code.toUpperCase();
    if (upperCode === 'QA-SUMMARY') {
      return { kind: 'summary', code: 'QA-SUMMARY', title: 'Release QA Summary', description: 'The overall QA summary text for this release.' };
    }
    const item = releaseItems.find(i => (i.code || '').toUpperCase() === upperCode);
    if (item) return { kind: 'item', ...item };
    const ev = qaEvidence.find(e => (e.code || '').toUpperCase() === upperCode);
    if (ev) return { kind: 'evidence', ...ev };
    return null;
  }

  /**
   * Find any QA analysis claims that cite this source code.
   */
  function findRelatedClaims(code) {
    if (!qaAnalysis || !code) return [];
    return qaAnalysis.filter(claim =>
      (claim.citedEvidenceCodes || []).some(c => c.toUpperCase() === code.toUpperCase())
    );
  }

  const supportStatusConfig = {
    supported: {
      label: 'Supported by Evidence',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200'
    },
    partially_supported: {
      label: 'Partially Supported',
      icon: AlertTriangle,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200'
    },
    not_supported: {
      label: 'Not Supported by Supplied Evidence',
      icon: ShieldAlert,
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200'
    },
    contradicted: {
      label: 'Contradicted by Evidence',
      icon: XCircle,
      color: 'text-red-800',
      bg: 'bg-red-100 border-red-300'
    },
    unable_to_assess: {
      label: 'Unable to Assess',
      icon: HelpCircle,
      color: 'text-slate-600',
      bg: 'bg-slate-50 border-slate-200'
    }
  };

  if (statements.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-border p-8 text-center text-xs text-ink-muted">
        <Microscope className="w-8 h-8 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold text-ink-primary">No statements to inspect.</p>
        <p className="mt-1">Run AI analysis to generate evidence-backed statements for exploration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 bg-white rounded-xl border border-surface-border shadow-xs">
        <div className="p-2 rounded-lg bg-saffron-50 text-saffron-600 border border-saffron-200">
          <Microscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink-primary">Evidence Explorer</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Select a generated statement to inspect its source records, evidence citations, and assessment status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Statement Selector Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-border shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-surface-border bg-surface-subtle">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {statements.length} Generated Statements
            </span>
          </div>
          <div className="divide-y divide-surface-border max-h-[480px] overflow-y-auto">
            {statements.map(stmt => (
              <button
                key={stmt.id}
                type="button"
                onClick={() => {
                  setSelectedStmtId(stmt.id === selectedStmtId ? null : stmt.id);
                  setOpenSourceCode(null);
                }}
                className={`w-full text-left p-3.5 flex items-start gap-2.5 transition-colors ${
                  selectedStmtId === stmt.id
                    ? 'bg-saffron-50 border-l-2 border-saffron-500'
                    : 'hover:bg-surface-subtle border-l-2 border-transparent'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {selectedStmtId === stmt.id
                    ? <ChevronDown className="w-3.5 h-3.5 text-saffron-600" />
                    : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  }
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border">
                      {stmt.id}
                    </span>
                    <StatusBadge type="reviewState" value={stmt.reviewState} />
                    {stmt.isStale && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        STALE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-secondary leading-snug line-clamp-2">
                    {stmt.currentContent}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-ink-muted">
                    <Tag className="w-2.5 h-2.5" />
                    <span>{stmt.sourceIdentifiers?.length || 0} source(s)</span>
                    <span className="capitalize ml-1 text-slate-500">· {stmt.statementType?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Detail Panel */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedStmt ? (
            <div className="bg-white rounded-xl border border-surface-border p-8 text-center text-xs text-ink-muted h-full flex flex-col items-center justify-center gap-2">
              <Microscope className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-ink-secondary">Select a statement on the left to inspect its evidence.</p>
            </div>
          ) : (
            <>
              {/* Statement Details Card */}
              <div className="bg-white rounded-xl border border-surface-border p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border">
                      {selectedStmt.id}
                    </span>
                    <span className="text-xs font-semibold text-ink-secondary capitalize">
                      {selectedStmt.statementType?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedStmt.isStale && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>STALE SOURCE</span>
                      </span>
                    )}
                    <StatusBadge type="reviewState" value={selectedStmt.reviewState} />
                  </div>
                </div>

                {/* Stale warning */}
                {selectedStmt.isStale && selectedStmt.staleReason && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span><strong>Staleness reason:</strong> {selectedStmt.staleReason}</span>
                  </div>
                )}

                {/* Current content */}
                <div>
                  <p className="text-xs font-semibold text-ink-muted mb-1">Current Statement</p>
                  <p className="text-sm text-ink-primary leading-relaxed font-medium p-3 bg-surface-subtle rounded-lg border">
                    {selectedStmt.currentContent}
                  </p>
                </div>

                {/* Original vs current diff indicator */}
                {selectedStmt.originalContent !== selectedStmt.currentContent && (
                  <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs">
                    <p className="font-semibold text-indigo-800 mb-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>Original AI-Generated Version (before human edit):</span>
                    </p>
                    <p className="text-indigo-700 leading-relaxed">{selectedStmt.originalContent}</p>
                  </div>
                )}
              </div>

              {/* Supporting Source Records */}
              <div className="bg-white rounded-xl border border-surface-border shadow-xs overflow-hidden">
                <div className="px-5 py-3 border-b border-surface-border bg-surface-subtle flex items-center gap-2">
                  <FileText className="w-4 h-4 text-saffron-600" />
                  <h4 className="text-sm font-bold text-ink-primary">
                    Supporting Source Records ({selectedStmt.sourceIdentifiers?.length || 0})
                  </h4>
                </div>

                {(!selectedStmt.sourceIdentifiers || selectedStmt.sourceIdentifiers.length === 0) ? (
                  <div className="p-6 text-center text-xs text-ink-muted">
                    <p>No source identifiers recorded for this statement.</p>
                    <p className="mt-1 text-amber-700 font-medium">
                      ⚠️ Statements without source identifiers cannot be verified against evidence.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-border">
                    {selectedStmt.sourceIdentifiers.map(code => {
                      const record = findSourceRecord(code);
                      const relatedClaims = findRelatedClaims(code);
                      const isOpen = openSourceCode === code;

                      return (
                        <div key={code}>
                          <button
                            type="button"
                            onClick={() => setOpenSourceCode(isOpen ? null : code)}
                            className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-surface-subtle transition-colors"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              {record?.kind === 'evidence' ? (
                                <ShieldCheck className="w-4 h-4 text-saffron-600 mt-0.5 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border">
                                    {code}
                                  </span>
                                  {record ? (
                                    <>
                                      <span className="text-xs font-semibold text-ink-primary truncate">
                                        {record.title}
                                      </span>
                                      {record.kind === 'item' && (
                                        <StatusBadge type="category" value={record.category} />
                                      )}
                                      {record.kind === 'evidence' && (
                                        <StatusBadge type="evidenceStatus" value={record.status} />
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-xs text-red-600 font-semibold">
                                      ⚠️ Source record not found in this release
                                    </span>
                                  )}
                                </div>
                                {record?.description && (
                                  <p className="text-xs text-ink-secondary mt-0.5 leading-snug line-clamp-1">
                                    {record.description || record.details}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isOpen
                              ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            }
                          </button>

                          {/* Expanded detail panel */}
                          {isOpen && (
                            <div className="px-4 pb-4 bg-slate-50 border-t border-surface-border space-y-3">
                              {!record ? (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2 mt-3">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <div>
                                    <strong>Invalid Citation:</strong> This source identifier ({code}) does not correspond to any release item or QA evidence record in this release package.
                                    The AI may have referenced a hallucinated or cross-version identifier.
                                    This citation should not be treated as evidence support.
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 space-y-2.5">
                                  {/* Full record details */}
                                  <div className="p-3 bg-white rounded-lg border border-surface-border text-xs space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border text-[11px]">
                                        {code}
                                      </span>
                                      <strong className="text-ink-primary">{record.title}</strong>
                                    </div>
                                    {(record.description || record.details) && (
                                      <p className="text-ink-secondary leading-relaxed">
                                        {record.description || record.details}
                                      </p>
                                    )}
                                    {record.kind === 'evidence' && (
                                      <div className="flex items-center gap-3 pt-1 border-t border-surface-border">
                                        <span className="text-ink-muted">Type: <strong className="text-ink-primary capitalize">{record.type?.replace(/_/g, ' ')}</strong></span>
                                        <span className="text-ink-muted">Status: <StatusBadge type="evidenceStatus" value={record.status} /></span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Related QA claims for evidence records */}
                                  {record.kind === 'evidence' && relatedClaims.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                                        AI Evidence Assessment for Claims Citing {code}:
                                      </p>
                                      {relatedClaims.map((claim, idx) => {
                                        const cfg = supportStatusConfig[claim.supportStatus] || supportStatusConfig.unable_to_assess;
                                        const ClaimIcon = cfg.icon;
                                        return (
                                          <div key={idx} className={`p-3 rounded-lg border text-xs space-y-1 ${cfg.bg}`}>
                                            <div className="flex items-start gap-2">
                                              <ClaimIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.color}`} />
                                              <div>
                                                <p className={`font-semibold ${cfg.color}`}>
                                                  {cfg.label}
                                                </p>
                                                <p className="text-ink-secondary mt-0.5">
                                                  Claim: "{claim.claimText}"
                                                </p>
                                              </div>
                                            </div>
                                            {claim.explanation && (
                                              <p className="text-ink-secondary pl-5 leading-relaxed">
                                                {claim.explanation}
                                              </p>
                                            )}
                                            {claim.supportStatus === 'not_supported' && (
                                              <p className="pl-5 text-red-700 font-medium text-[11px]">
                                                ⚠️ The supplied QA evidence does not establish this claim. Human review required before accepting.
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
