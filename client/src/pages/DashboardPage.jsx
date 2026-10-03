import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  Layers,
  FileText,
  GitBranch
} from 'lucide-react';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import { ScoreGauge } from '../components/ScoreGauge';

export function DashboardPage() {
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    api.getReleases()
      .then(res => {
        if (isMounted) setReleases(res.releases || []);
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const totalReleases = releases.length;
  const readyReleases = releases.filter(r => (r.acceptedStatementsCount > 0 && r.staleStatementsCount === 0)).length;
  const awaitingReviewCount = releases.filter(r => r.statementCount > 0 && r.acceptedStatementsCount < r.statementCount).length;
  const staleStatementsTotal = releases.reduce((sum, r) => sum + (r.staleStatementsCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Subtle Saffron Gradient */}
      <div className="p-6 sm:p-8 rounded-2xl bg-saffron-hero-gradient border border-saffron-200/80 shadow-soft flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-saffron-100 text-saffron-900 border border-saffron-300/80">
            <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
            <span>AI Evidence & Traceability Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-primary">
            Prepare Accurate, Evidence-Backed Release Briefs
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Deterministic readiness checks, genuine Gemini AI analysis, QA claim verification, immutable snapshot comparisons, and human-in-the-loop review.
          </p>
        </div>

        <Link
          to="/releases/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 shadow-saffron-glow transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Release</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-surface-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Total Packages</span>
            <Package className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-ink-primary">{totalReleases}</p>
          <p className="text-[11px] text-ink-muted">Across all configured milestones</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-surface-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Fully Reviewed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-800">{readyReleases}</p>
          <p className="text-[11px] text-emerald-600">Verified briefs ready for stakeholders</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-surface-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-800">{awaitingReviewCount}</p>
          <p className="text-[11px] text-amber-700">Pending statement review decisions</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-surface-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Stale Statements</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-red-800">{staleStatementsTotal}</p>
          <p className="text-[11px] text-red-600">Dependent statements needing refresh</p>
        </div>
      </div>

      {/* Recent Releases Section */}
      <div className="bg-white rounded-xl border border-surface-border shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div>
            <h3 className="text-base font-bold text-ink-primary">Recent Release Packages</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Live status, item counts, QA evidence, and review readiness.
            </p>
          </div>

          <Link
            to="/releases"
            className="text-xs font-semibold text-saffron-700 hover:text-saffron-800 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-ink-muted">
            Loading release packages...
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        ) : releases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-ink-primary">No release packages yet</p>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Create your first software release package to begin deterministic validation and AI evidence analysis.
            </p>
            <Link
              to="/releases/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-saffron-600 hover:bg-saffron-700"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Release</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-ink-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Release & Version</th>
                  <th className="py-3 px-3">Owner / Target Date</th>
                  <th className="py-3 px-3 text-center">Items / QA</th>
                  <th className="py-3 px-3 text-center">Snapshots</th>
                  <th className="py-3 px-3 text-center">Review Progress</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {releases.map((rel) => (
                  <tr key={rel.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <Link
                        to={`/releases/${rel.id}`}
                        className="font-bold text-sm text-ink-primary hover:text-saffron-700 block"
                      >
                        {rel.name}
                      </Link>
                      <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {rel.version}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-ink-secondary">
                      <div className="font-medium">{rel.owner || 'Unassigned'}</div>
                      <div className="text-[11px] text-ink-muted">{formatDate(rel.releaseDate)}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        <span>{rel.itemCount} items</span>
                        <span>•</span>
                        <span>{rel.evidenceCount} QA</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {rel.snapshotCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {rel.staleStatementsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          {rel.staleStatementsCount} Stale
                        </span>
                      ) : rel.acceptedStatementsCount > 0 && rel.acceptedStatementsCount === rel.statementCount ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border">
                          {rel.acceptedStatementsCount || 0}/{rel.statementCount || 0} Accepted
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/releases/${rel.id}`}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold text-saffron-800 bg-saffron-50 hover:bg-saffron-100 border border-saffron-200 transition-colors"
                        >
                          Open Hub
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
