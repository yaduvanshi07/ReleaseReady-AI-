import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Layers, 
  CheckCircle2,
  Table2,
  Microscope,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { ChangeImpactMatrix } from './ChangeImpactMatrix';
import { EvidenceExplorer } from './EvidenceExplorer';
import { api } from '../../lib/api';

const TABS = [
  { id: 'summaries',    label: 'Summaries',          icon: FileText },
  { id: 'impact',       label: 'Impact Matrix',       icon: Table2 },
  { id: 'qa_evidence',  label: 'Evidence Analysis',   icon: ShieldCheck },
  { id: 'missing',      label: 'Gaps & Actions',      icon: HelpCircle },
  { id: 'explorer',     label: 'Evidence Explorer',   icon: Microscope },
];

export function AIAnalysisPanel({ releaseId, analysis, onAnalysisUpdated, releaseItems = [], qaEvidence = [], statements = [] }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summaries');

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await api.triggerAnalysis(releaseId);
      if (onAnalysisUpdated) {
        onAnalysisUpdated(res.analysis);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete AI release analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl border border-surface-border p-8 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-saffron-50 border border-saffron-200 text-saffron-600 flex items-center justify-center mx-auto shadow-saffron-glow">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-ink-primary">AI Release Analysis</h3>
          <p className="text-sm text-ink-muted max-w-md mx-auto mt-1">
            Run real Gemini analysis to classify impact, detect missing info, verify claims against QA evidence, and synthesize dual summaries.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg max-w-lg mx-auto text-left flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          id="btn-run-analysis"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isAnalyzing ? 'Analyzing Release Evidence...' : 'Generate AI Release Analysis'}</span>
        </button>
      </div>
    );
  }

  /* ─── Badge counts for tabs ─── */
  const gapCount = (analysis.missingInformation || []).length;
  const unsupportedCount = (analysis.qaEvidenceAnalysis || []).filter(
    c => c.supportStatus === 'not_supported' || c.supportStatus === 'contradicted'
  ).length;

  // Build impact matrix rows from impactClassifications + qaEvidenceAnalysis
  const impactMatrix = (analysis.impactClassifications || []).map(imp => {
    // find related QA analysis claim for the same item
    const relatedClaim = (analysis.qaEvidenceAnalysis || []).find(c =>
      (c.citedEvidenceCodes || []).some(code => code === imp.itemCode) ||
      (c.claimText || '').toLowerCase().includes((imp.itemCode || '').toLowerCase())
    );
    const item = releaseItems.find(i => i.code === imp.itemCode);
    const affectedGroupItems = releaseItems.filter(i => i.category === 'affected_user_group');

    return {
      sourceCode: imp.itemCode,
      title: item?.title || imp.itemCode,
      category: item?.category || 'feature',
      impactLevel: imp.impact,
      affectedGroups: affectedGroupItems.map(i => i.title).slice(0, 3),
      evidenceCoverage: relatedClaim?.supportStatus || 'unable_to_assess',
      recommendation: imp.uncertainties || imp.explanation?.slice(0, 120) || ''
    };
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-surface-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-saffron-50 text-saffron-600 border border-saffron-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-primary">Evidence-Backed AI Analysis</h3>
            <span className="text-xs text-ink-muted flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {analysis.modelUsed || 'Google Gemini'} · {new Date(analysis.createdAt || Date.now()).toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          id="btn-regenerate-analysis"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-saffron-800 bg-saffron-50 hover:bg-saffron-100 border border-saffron-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Re-analyzing...' : 'Regenerate Analysis'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-surface-border shadow-xs overflow-hidden">
        <div className="flex overflow-x-auto border-b border-surface-border bg-surface-subtle/50">
          {TABS.map(tab => {
            const Icon = tab.icon;
            let badge = null;
            if (tab.id === 'missing' && gapCount > 0) badge = gapCount;
            if (tab.id === 'qa_evidence' && unsupportedCount > 0) badge = unsupportedCount;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-saffron-500 text-saffron-700 bg-white'
                    : 'border-transparent text-ink-muted hover:text-ink-primary hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {badge !== null && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab.id === 'missing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-5 space-y-5">

          {/* ── SUMMARIES ── */}
          {activeTab === 'summaries' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Technical Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-saffron-600" />
                    <span>Technical Summary</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">For Dev & QA</span>
                </div>
                <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border">
                  <p className="text-xs text-ink-secondary leading-relaxed whitespace-pre-line">
                    {analysis.technicalSummary}
                  </p>
                </div>
              </div>

              {/* Stakeholder Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Stakeholder Summary</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">For Clients & PMs</span>
                </div>
                <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border">
                  <p className="text-xs text-ink-secondary leading-relaxed whitespace-pre-line">
                    {analysis.stakeholderSummary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── IMPACT MATRIX ── */}
          {activeTab === 'impact' && (
            <ChangeImpactMatrix
              impactMatrix={impactMatrix}
              releaseItems={releaseItems}
            />
          )}

          {/* ── QA EVIDENCE ANALYSIS ── */}
          {activeTab === 'qa_evidence' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-saffron-600" />
                  <span>QA Evidence Claim Support Analysis</span>
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  Cross-references release claims against actual QA evidence artifacts.
                  <strong className="text-ink-primary ml-1">AI never approves a release.</strong>
                </p>
              </div>

              <div className="space-y-3">
                {(analysis.qaEvidenceAnalysis || []).length === 0 ? (
                  <p className="text-xs text-ink-muted text-center py-6">No QA evidence claims were analysed.</p>
                ) : (
                  (analysis.qaEvidenceAnalysis || []).map((claim, idx) => {
                    const statusBadgeColor = 
                      claim.supportStatus === 'supported' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      claim.supportStatus === 'contradicted' ? 'bg-red-100 text-red-800 border-red-300' :
                      claim.supportStatus === 'not_supported' ? 'bg-red-50 text-red-700 border-red-200' :
                      claim.supportStatus === 'partially_supported' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                      <div key={idx} className="p-3.5 rounded-lg border border-surface-border bg-white space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-ink-primary">"{claim.claimText}"</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadgeColor}`}>
                            {claim.supportStatus.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary">{claim.explanation}</p>
                        {claim.citedEvidenceCodes && claim.citedEvidenceCodes.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                            <span>Cited Evidence:</span>
                            {claim.citedEvidenceCodes.map(code => (
                              <span key={code} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border">
                                {code}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── GAPS & ACTIONS ── */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-saffron-600" />
                  <span>Missing Information & Required Actions</span>
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  Items flagged as incomplete, unverified, or requiring follow-up before this release can proceed.
                </p>
              </div>

              {(analysis.missingInformation || []).length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No missing information or critical omissions detected by AI analysis.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(analysis.missingInformation || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-amber-900 font-semibold">{item.fieldOrTopic}</strong>
                        <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                          {item.issueType?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-ink-secondary">{item.description}</p>
                      <p className="text-amber-800 text-[11px] pt-1 font-medium border-t border-amber-200 mt-1">
                        <strong>Required Action: </strong>{item.suggestedAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── EVIDENCE EXPLORER ── */}
          {activeTab === 'explorer' && (
            <EvidenceExplorer
              statements={statements}
              releaseItems={releaseItems}
              qaEvidence={qaEvidence}
              qaAnalysis={analysis.qaEvidenceAnalysis || []}
            />
          )}

        </div>
      </div>
    </div>
  );
}
