import React from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { ITEM_CATEGORIES } from '../../lib/constants';
import {
  Table2,
  Zap,
  AlertTriangle,
  Info,
  Users,
  HelpCircle
} from 'lucide-react';

/**
 * ChangeImpactMatrix
 *
 * Renders an AI-derived change impact matrix:
 * - rows: completed features, bug fixes, changed behaviours, migration notes
 * - columns: risk level, affected user groups, evidence coverage flag, recommendation
 *
 * Uses the impactMatrix array from the AI analysis response.
 */
export function ChangeImpactMatrix({ impactMatrix = [], releaseItems = [] }) {
  const IMPACT_COLORS = {
    Low:     'bg-emerald-50 text-emerald-800 border-emerald-200',
    Moderate:'bg-amber-50 text-amber-800 border-amber-200',
    High:    'bg-red-50 text-red-800 border-red-200',
    Unknown: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const COVERAGE_COLORS = {
    supported:          'text-emerald-700',
    partially_supported:'text-amber-700',
    not_supported:      'text-red-700',
    contradicted:       'text-red-800',
    unable_to_assess:   'text-slate-500'
  };

  const COVERAGE_LABELS = {
    supported:          '✅ Supported',
    partially_supported:'⚠️ Partial',
    not_supported:      '❌ Not Supported',
    contradicted:       '🚫 Contradicted',
    unable_to_assess:   '? Unable to Assess'
  };

  // If no impact matrix rows, try to build from release items + a "no AI" indicator
  const rows = impactMatrix.length > 0
    ? impactMatrix
    : releaseItems
        .filter(i => ['feature', 'bug_fix', 'changed_behavior', 'migration_note'].includes(i.category))
        .map(i => ({
          sourceCode: i.code || '—',
          title: i.title,
          category: i.category,
          impactLevel: 'Unknown',
          affectedGroups: [],
          evidenceCoverage: 'unable_to_assess',
          recommendation: 'Run AI analysis to assess this change.'
        }));

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-border p-8 text-center text-xs text-ink-muted">
        <Table2 className="w-8 h-8 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold text-ink-secondary">No change items to display.</p>
        <p className="mt-1">Add features, bug fixes, or changed behaviours to see the impact matrix.</p>
      </div>
    );
  }

  const categoryCounts = {
    High: rows.filter(r => r.impactLevel === 'High').length,
    Moderate: rows.filter(r => r.impactLevel === 'Moderate').length,
    not_supported: rows.filter(r => r.evidenceCoverage === 'not_supported' || r.evidenceCoverage === 'contradicted').length
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-saffron-50 text-saffron-600 border border-saffron-200">
            <Table2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-primary">Change Impact Matrix</h3>
            <p className="text-xs text-ink-muted">{rows.length} release change(s) assessed</p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {categoryCounts.High > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
              <Zap className="w-3 h-3" />
              {categoryCounts.High} High Impact
            </span>
          )}
          {categoryCounts.Moderate > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              {categoryCounts.Moderate} Moderate
            </span>
          )}
          {categoryCounts.not_supported > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <HelpCircle className="w-3 h-3" />
              {categoryCounts.not_supported} Unsupported Claims
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-subtle border-b border-surface-border">
                <th className="text-left px-4 py-3 font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">
                  Code
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink-muted uppercase tracking-wider">
                  Change
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">
                  Risk Level
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">
                  Affected Users
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">
                  Evidence
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink-muted uppercase tracking-wider">
                  AI Recommendation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {rows.map((row, idx) => (
                <tr
                  key={row.sourceCode || idx}
                  className={`hover:bg-surface-subtle transition-colors ${
                    row.impactLevel === 'High' ? 'bg-red-50/30' : ''
                  }`}
                >
                  {/* Code */}
                  <td className="px-4 py-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                    <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                      {row.sourceCode || '—'}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3 text-ink-primary font-medium max-w-[200px]">
                    <span className="line-clamp-2 leading-snug">{row.title || '—'}</span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge type="category" value={row.category} />
                  </td>

                  {/* Risk */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      IMPACT_COLORS[row.impactLevel] || IMPACT_COLORS.Unknown
                    }`}>
                      {row.impactLevel === 'High' && <Zap className="w-3 h-3 mr-1" />}
                      {row.impactLevel || 'Unknown'}
                    </span>
                  </td>

                  {/* Affected groups */}
                  <td className="px-4 py-3 max-w-[140px]">
                    {row.affectedGroups && row.affectedGroups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.affectedGroups.slice(0, 2).map((g, gi) => (
                          <span key={gi} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-medium text-slate-700">
                            <Users className="w-2.5 h-2.5" />
                            {g}
                          </span>
                        ))}
                        {row.affectedGroups.length > 2 && (
                          <span className="text-[10px] text-ink-muted">+{row.affectedGroups.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-ink-muted italic">—</span>
                    )}
                  </td>

                  {/* Evidence coverage */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-semibold ${COVERAGE_COLORS[row.evidenceCoverage] || 'text-slate-500'}`}>
                      {COVERAGE_LABELS[row.evidenceCoverage] || '?'}
                    </span>
                  </td>

                  {/* Recommendation */}
                  <td className="px-4 py-3 text-ink-secondary max-w-[200px]">
                    {row.recommendation ? (
                      <div className="flex items-start gap-1.5">
                        <Info className="w-3 h-3 text-saffron-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-snug text-[11px]">{row.recommendation}</span>
                      </div>
                    ) : (
                      <span className="text-ink-muted italic">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-[11px] text-ink-muted flex items-start gap-1.5">
        <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Risk levels and evidence assessments are AI-derived and must be human-reviewed.
          <strong className="text-ink-primary"> AI will never approve or deploy software.</strong>
          Final release decisions remain with the release owner.
        </span>
      </p>
    </div>
  );
}
