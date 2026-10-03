export const ITEM_CATEGORIES = [
  { value: 'feature', label: 'Feature', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'bug_fix', label: 'Bug Fix', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'changed_behavior', label: 'Changed Behaviour', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'known_limitation', label: 'Known Limitation', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'migration_note', label: 'Migration Note', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'affected_user_group', label: 'Affected Users', color: 'bg-slate-50 text-slate-700 border-slate-200' }
];

export const EVIDENCE_TYPES = [
  { value: 'test_suite', label: 'Automated Test Suite' },
  { value: 'manual_test', label: 'Manual QA Test' },
  { value: 'performance_metric', label: 'Performance Metric / Benchmark' },
  { value: 'security_scan', label: 'Security & Vulnerability Scan' },
  { value: 'user_acceptance', label: 'User Acceptance Test (UAT)' },
  { value: 'other', label: 'Other Verification Artifact' }
];

export const EVIDENCE_STATUSES = [
  { value: 'passed', label: 'Passed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'failed', label: 'Failed', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'partial', label: 'Partial', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'blocked', label: 'Blocked', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' }
];

export const REVIEW_STATES = [
  { value: 'generated', label: 'Generated', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'edited', label: 'Edited', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'accepted', label: 'Accepted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'needs_review', label: 'Needs Review', color: 'bg-amber-50 text-amber-700 border-amber-200' }
];

export const IMPACT_LEVELS = {
  Low: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Minimal risk or blast radius' },
  Moderate: { color: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Noticeable customer or system impact' },
  High: { color: 'bg-red-50 text-red-700 border-red-200', desc: 'Critical operational or breaking impact' },
  Unknown: { color: 'bg-slate-50 text-slate-700 border-slate-200', desc: 'Insufficient data to classify' }
};
