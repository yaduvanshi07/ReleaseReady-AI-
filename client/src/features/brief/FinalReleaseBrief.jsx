import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Bug, 
  HelpCircle, 
  Terminal, 
  Users 
} from 'lucide-react';
import { api } from '../../lib/api';
import { downloadMarkdown, formatDateTime } from '../../lib/utils';
import { ScoreGauge } from '../../components/ScoreGauge';

export function FinalReleaseBrief({ releaseId, versionId = null }) {
  const [briefData, setBriefData] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    api.getBrief(releaseId, versionId)
      .then(res => {
        setBriefData(res.brief);
        setMarkdown(res.markdown);
      })
      .catch(err => {
        setError(err.message || 'Failed to load release brief.');
      })
      .finally(() => setIsLoading(false));
  }, [releaseId, versionId]);

  const handleCopyMarkdown = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!markdown || !briefData) return;
    const filename = `release-brief-${briefData.releaseName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${briefData.version}.md`;
    downloadMarkdown(filename, markdown);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-xl border text-center text-xs text-ink-muted">
        Compiling final release brief...
      </div>
    );
  }

  if (error || !briefData) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700 text-xs">
        {error || 'Unable to generate brief.'}
      </div>
    );
  }

  const { sections, reviewSummary, risksAndWarnings } = briefData;

  return (
    <div className="space-y-6">
      {/* Action Header Bar (Hidden during browser print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-surface-border shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-saffron-600" />
            <span>Final Release Brief Document</span>
          </h3>
          <span className="text-xs text-ink-muted">
            Snapshot Status: {briefData.isSnapshot ? `Frozen Version (${briefData.snapshotVersionLabel})` : 'Active Working Draft'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle border border-surface-border transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-saffron-600 hover:bg-saffron-700 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Brief</span>
          </button>
        </div>
      </div>

      {/* Printable Brief Paper Container */}
      <div className="print-container bg-white rounded-xl border border-surface-border p-6 sm:p-10 shadow-card space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b border-surface-border pb-6 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-saffron-700">
                Official Release Brief
              </span>
              <h1 className="text-2xl font-bold text-ink-primary mt-1">
                {briefData.releaseName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted mt-1">
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border">
                  {briefData.version}
                </span>
                <span>•</span>
                <span>Target Date: <strong>{briefData.releaseDate}</strong></span>
                <span>•</span>
                <span>Owner: <strong>{briefData.owner}</strong></span>
              </div>
            </div>

            <ScoreGauge score={briefData.validationScore} isReady={briefData.isDeterministicReady} size="sm" />
          </div>

          <div className="pt-2 text-[11px] text-ink-muted flex flex-wrap items-center justify-between gap-2">
            <span>Compiled: {formatDateTime(briefData.generatedAt)}</span>
            <span>
              Human Review Status: <strong>{briefData.isFullyReviewed ? '✅ Fully Verified' : '⚠️ Review In Progress'}</strong>
            </span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b pb-1.5">
            <span>1. Executive Summary</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
            {briefData.executiveSummary}
          </p>
        </section>

        {/* 2. Technical Summary */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b pb-1.5">
            <span>2. Technical Summary (For Engineering & QA)</span>
          </h2>
          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border text-xs sm:text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
            {briefData.technicalSummary}
          </div>
        </section>

        {/* 3. Stakeholder Summary */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b pb-1.5">
            <span>3. Stakeholder Summary (For Clients & Product Teams)</span>
          </h2>
          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border text-xs sm:text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
            {briefData.stakeholderSummary}
          </div>
        </section>

        {/* 4. Completed Features */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b pb-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>4. Completed Features ({sections.completedFeatures.length})</span>
          </h2>
          {sections.completedFeatures.length === 0 ? (
            <p className="text-xs text-ink-muted italic">No features listed.</p>
          ) : (
            <div className="space-y-2">
              {sections.completedFeatures.map((f) => (
                <div key={f.code} className="p-3 rounded-lg border bg-white text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border text-[11px]">
                      {f.code}
                    </span>
                    <strong className="text-ink-primary">{f.title}</strong>
                  </div>
                  {f.description && <p className="text-ink-secondary pl-2">{f.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. Bug Fixes */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b pb-1.5">
            <Bug className="w-4 h-4 text-blue-600" />
            <span>5. Bug Fixes ({sections.bugFixes.length})</span>
          </h2>
          {sections.bugFixes.length === 0 ? (
            <p className="text-xs text-ink-muted italic">No bug fixes listed.</p>
          ) : (
            <div className="space-y-2">
              {sections.bugFixes.map((b) => (
                <div key={b.code} className="p-3 rounded-lg border bg-white text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border text-[11px]">
                      {b.code}
                    </span>
                    <strong className="text-ink-primary">{b.title}</strong>
                  </div>
                  {b.description && <p className="text-ink-secondary pl-2">{b.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Changed Behavior */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b pb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>6. Changed Behaviour & Breaking Changes ({sections.changedBehavior.length})</span>
          </h2>
          {sections.changedBehavior.length === 0 ? (
            <p className="text-xs text-ink-muted italic">No breaking or behavioral changes documented.</p>
          ) : (
            <div className="space-y-2">
              {sections.changedBehavior.map((c) => (
                <div key={c.code} className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-white text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 text-[11px]">
                      {c.code}
                    </span>
                    <strong className="text-amber-950">{c.title}</strong>
                  </div>
                  {c.description && <p className="text-amber-900/80 pl-2">{c.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 7. QA Summary & Evidence */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b pb-1.5">
            <ShieldCheck className="w-4 h-4 text-saffron-600" />
            <span>7. QA Methodology & Verified Evidence</span>
          </h2>
          <p className="text-xs text-ink-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border">
            {sections.qaSummary}
          </p>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Supplied Test Evidence Records:</h3>
            {sections.qaEvidence.map((e) => (
              <div key={e.code} className="p-3 rounded-lg border bg-white text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border text-[11px]">
                      {e.code}
                    </span>
                    <strong className="text-ink-primary">{e.title}</strong>
                    <span className="text-[10px] text-ink-muted capitalize">({e.type.replace('_', ' ')})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                    e.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {e.status}
                  </span>
                </div>
                <p className="text-ink-secondary pl-2">{e.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Risks, Limitations & Migration Notes */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5">
            8. Operational Risks, Limitations & Migrations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border bg-surface-subtle space-y-2">
              <strong className="text-ink-primary block border-b pb-1">Known Limitations:</strong>
              {sections.knownLimitations.length === 0 ? (
                <p className="text-ink-muted italic">None documented.</p>
              ) : (
                sections.knownLimitations.map(l => (
                  <div key={l.code}>• <strong>[{l.code}]</strong> {l.title}</div>
                ))
              )}
            </div>

            <div className="p-3.5 rounded-lg border bg-surface-subtle space-y-2">
              <strong className="text-ink-primary block border-b pb-1">Migration & Setup Notes:</strong>
              {sections.migrationNotes.length === 0 ? (
                <p className="text-ink-muted italic">No migrations required.</p>
              ) : (
                sections.migrationNotes.map(m => (
                  <div key={m.code}>• <strong>[{m.code}]</strong> {m.title}</div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 9. Warnings & Unresolved Items */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5">
            9. Readiness Warnings & Unresolved Items
          </h2>
          {risksAndWarnings.length === 0 ? (
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>All deterministic readiness criteria verified. No blocking warnings.</span>
            </p>
          ) : (
            <div className="space-y-1.5">
              {risksAndWarnings.map((w, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 10. Human Review Audit Statement */}
        <footer className="pt-6 border-t border-surface-border text-xs text-ink-muted space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Review Decisions: {reviewSummary.acceptedCount} Accepted, {reviewSummary.editedCount} Edited, {reviewSummary.rejectedCount} Rejected, {reviewSummary.pendingCount} Pending</span>
            <span className="font-mono text-[11px]">Generated via ReleaseReady AI Assistant</span>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Note: Reviewing release communications certifies communication accuracy against supplied QA evidence and does not constitute automated software deployment.
          </p>
        </footer>
      </div>
    </div>
  );
}
