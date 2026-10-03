import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Layers, 
  Sparkles, 
  CheckSquare, 
  GitBranch, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { api } from '../lib/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { ReleaseEditor } from '../features/releases/ReleaseEditor';
import { AIAnalysisPanel } from '../features/analysis/AIAnalysisPanel';
import { ReviewPanel } from '../features/review/ReviewPanel';
import { VersionHistory } from '../features/versions/VersionHistory';
import { VersionComparison } from '../features/versions/VersionComparison';
import { FinalReleaseBrief } from '../features/brief/FinalReleaseBrief';

export function ReleaseDetailPage() {
  const { releaseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [release, setRelease] = useState(null);
  const [validation, setValidation] = useState(null);
  const [statements, setStatements] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [compareTargetId, setCompareTargetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [relRes, stmtsRes, snapsRes] = await Promise.all([
        api.getRelease(releaseId),
        api.getStatements(releaseId),
        api.getSnapshots(releaseId)
      ]);

      setRelease(relRes.release);
      setValidation(relRes.validation);
      setStatements(stmtsRes.statements || []);
      setSnapshots(snapsRes.snapshots || []);
    } catch (err) {
      setError(err.message || 'Failed to load release details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [releaseId]);

  const handleUpdateRelease = async (formData) => {
    setIsUpdating(true);
    try {
      const res = await api.updateRelease(releaseId, formData);
      setRelease(res.release);
      setValidation(res.validation);

      // Refresh statements in case some became stale
      const stmtsRes = await api.getStatements(releaseId);
      setStatements(stmtsRes.statements || []);
      setSearchParams({ tab: 'overview' });
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAnalysisUpdated = async (analysisResult) => {
    // Reload statements and release
    const [relRes, stmtsRes] = await Promise.all([
      api.getRelease(releaseId),
      api.getStatements(releaseId)
    ]);
    setRelease(relRes.release);
    setValidation(relRes.validation);
    setStatements(stmtsRes.statements || []);
  };

  const handleStatementUpdated = (updatedStatement) => {
    setStatements(prev => prev.map(s => s.id === updatedStatement.id ? updatedStatement : s));
  };

  const handleSnapshotCreated = (newSnapshot) => {
    setSnapshots(prev => [newSnapshot, ...prev]);
  };

  const handleSelectForCompare = (snapshotId) => {
    setCompareTargetId(snapshotId);
    setSearchParams({ tab: 'compare' });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-xl border text-center text-xs text-ink-muted">
        Loading release workspace...
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700 text-xs">
        {error || 'Release not found.'}
      </div>
    );
  }

  const staleStatementsCount = statements.filter(s => s.isStale).length;
  const acceptedStatementsCount = statements.filter(s => s.reviewState === 'accepted').length;

  const hubTabs = [
    { id: 'overview', label: 'Overview & Checks', icon: ShieldCheck },
    { id: 'editor', label: 'Edit Package & Items', icon: Edit },
    { id: 'analysis', label: 'AI Release Analysis', icon: Sparkles },
    { 
      id: 'review', 
      label: 'Human Review', 
      icon: CheckSquare, 
      count: staleStatementsCount > 0 ? `${staleStatementsCount} stale` : statements.length,
      badgeColor: staleStatementsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
    },
    { id: 'versions', label: 'Version Snapshots', icon: GitBranch, count: snapshots.length },
    { id: 'compare', label: 'Compare Versions', icon: GitBranch },
    { id: 'brief', label: 'Final Release Brief', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-surface-border p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-saffron-50 text-saffron-900 border border-saffron-200 px-2 py-0.5 rounded">
                {release.version}
              </span>
              <span className="text-xs text-ink-muted">Target: {release.releaseDate || 'TBD'}</span>
              <span>•</span>
              <span className="text-xs text-ink-muted">Owner: {release.owner || 'Unassigned'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-primary">
              {release.name}
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-3xl">
              {release.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <ScoreGauge score={validation?.score || 0} isReady={validation?.isReady || false} size="sm" />
            <div className="text-[11px] text-ink-muted">
              {release.items.length} items • {release.evidence.length} QA records • {statements.length} statements
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-border overflow-x-auto pt-2">
          {hubTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-saffron-500 text-saffron-900 font-semibold bg-saffron-50/50'
                    : 'border-transparent text-ink-secondary hover:text-ink-primary hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-saffron-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${tab.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <ScoreGauge score={validation?.score || 0} isReady={validation?.isReady || false} size="md" />

          {/* Missing Required / Risks Banner */}
          {validation && validation.missingRequired.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Blocking Required Information Missing ({validation.missingRequired.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {validation.missingRequired.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Deterministic Validation Checks Breakdown */}
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-ink-primary border-b pb-2">
              Deterministic Release Readiness Checks
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(validation?.checks || []).map(c => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                    c.passed
                      ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                      : 'bg-red-50/40 border-red-200 text-red-950'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.passed ? 'bg-emerald-600' : 'bg-red-600'}`} />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="font-semibold">{c.label}</strong>
                      <span className="text-[10px] text-ink-muted uppercase">({c.category})</span>
                    </div>
                    <p className="text-ink-secondary">{c.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-surface-border text-xs space-y-1">
              <span className="text-ink-muted">Features & Bug Fixes</span>
              <p className="text-lg font-bold text-ink-primary">
                {release.items.filter(i => i.category === 'feature').length} Features / {release.items.filter(i => i.category === 'bug_fix').length} Fixes
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-surface-border text-xs space-y-1">
              <span className="text-ink-muted">Verified QA Records</span>
              <p className="text-lg font-bold text-ink-primary">
                {release.evidence.filter(e => e.status === 'passed').length}/{release.evidence.length} Passed
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-surface-border text-xs space-y-1">
              <span className="text-ink-muted">Human Review Decisions</span>
              <p className="text-lg font-bold text-ink-primary">
                {acceptedStatementsCount}/{statements.length} Accepted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Editor */}
      {activeTab === 'editor' && (
        <ReleaseEditor
          initialData={release}
          onSave={handleUpdateRelease}
          isSubmitting={isUpdating}
        />
      )}

      {/* Tab: Analysis */}
      {activeTab === 'analysis' && (
        <AIAnalysisPanel
          releaseId={release.id}
          analysis={release.latestAnalysis}
          onAnalysisUpdated={handleAnalysisUpdated}
          releaseItems={release.items || []}
          qaEvidence={release.evidence || []}
          statements={statements}
        />
      )}

      {/* Tab: Review */}
      {activeTab === 'review' && (
        <ReviewPanel
          statements={statements}
          onStatementUpdated={handleStatementUpdated}
          releaseItems={release.items}
          qaEvidence={release.evidence}
        />
      )}

      {/* Tab: Versions */}
      {activeTab === 'versions' && (
        <VersionHistory
          releaseId={release.id}
          snapshots={snapshots}
          onSnapshotCreated={handleSnapshotCreated}
          onSelectForCompare={handleSelectForCompare}
        />
      )}

      {/* Tab: Compare */}
      {activeTab === 'compare' && (
        <VersionComparison
          releaseId={release.id}
          snapshots={snapshots}
          defaultTargetId={compareTargetId || 'current'}
        />
      )}

      {/* Tab: Brief */}
      {activeTab === 'brief' && (
        <FinalReleaseBrief
          releaseId={release.id}
        />
      )}
    </div>
  );
}
