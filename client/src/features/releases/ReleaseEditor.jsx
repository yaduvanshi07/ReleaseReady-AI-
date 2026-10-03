import React, { useState } from 'react';
import { ItemListEditor } from './ItemListEditor';
import { QAEvidenceEditor } from './QAEvidenceEditor';
import { ScoreGauge } from '../../components/ScoreGauge';
import { 
  Sparkles, 
  Save, 
  Layers, 
  Bug, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  Users, 
  Terminal,
  Calendar,
  User,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { HorizontalScrollTabs } from '../../components/HorizontalScrollTabs';

export function ReleaseEditor({ initialData = null, onSave, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    version: initialData?.version || 'v1.0.0',
    description: initialData?.description || '',
    releaseDate: initialData?.releaseDate || new Date().toISOString().split('T')[0],
    owner: initialData?.owner || '',
    qaSummary: initialData?.qaSummary || '',
    items: initialData?.items || [],
    evidence: initialData?.evidence || []
  });

  const [activeTab, setActiveTab] = useState('metadata');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChangeField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Release Name is required.');
      setActiveTab('metadata');
      return;
    }
    if (!formData.version.trim()) {
      setErrorMsg('Version identifier is required.');
      setActiveTab('metadata');
      return;
    }

    // Prune blank items where title was not provided
    const validItems = (formData.items || [])
      .filter(item => item && item.title && item.title.trim().length > 0)
      .map((item, idx) => ({
        ...item,
        title: item.title.trim(),
        description: (item.description || '').trim(),
        displayOrder: idx + 1
      }));

    // Prune blank QA evidence records where title or details are missing
    const validEvidence = (formData.evidence || [])
      .filter(ev => ev && ev.title && ev.title.trim().length > 0 && ev.details && ev.details.trim().length > 0)
      .map(ev => ({
        ...ev,
        title: ev.title.trim(),
        details: ev.details.trim()
      }));

    setErrorMsg(null);
    onSave({
      ...formData,
      name: formData.name.trim(),
      version: formData.version.trim(),
      description: (formData.description || '').trim(),
      owner: (formData.owner || '').trim(),
      qaSummary: (formData.qaSummary || '').trim(),
      items: validItems,
      evidence: validEvidence
    });
  };

  const tabs = [
    { id: 'metadata', label: '1. Metadata & Scope', icon: FileText },
    { id: 'features', label: '2. Features', icon: Layers, count: formData.items.filter(i => i.category === 'feature').length },
    { id: 'bug_fixes', label: '3. Bug Fixes', icon: Bug, count: formData.items.filter(i => i.category === 'bug_fix').length },
    { id: 'behavior', label: '4. Changed Behaviour', icon: AlertTriangle, count: formData.items.filter(i => i.category === 'changed_behavior').length },
    { id: 'qa', label: '5. QA & Evidence', icon: ShieldCheck, count: formData.evidence.length },
    { id: 'limitations', label: '6. Limitations', icon: HelpCircle, count: formData.items.filter(i => i.category === 'known_limitation').length },
    { id: 'migrations', label: '7. Operations / Migrations', icon: Terminal, count: formData.items.filter(i => i.category === 'migration_note').length },
    { id: 'users', label: '8. Affected Users', icon: Users, count: formData.items.filter(i => i.category === 'affected_user_group').length },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs Header with Horizontal Auto-Scroll & Controls */}
      <div className="bg-slate-50/70 p-1.5 rounded-xl border border-surface-border shadow-2xs">
        <HorizontalScrollTabs
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          autoScrollSpeed={0.45}
        />
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-xl border border-surface-border p-6 shadow-xs min-h-[350px]">
        {/* Tab 1: Metadata */}
        {activeTab === 'metadata' && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-base font-bold text-ink-primary border-b pb-2">Release Scope & Core Metadata</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Release Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChangeField('name', e.target.value)}
                  placeholder="e.g. Payment Gateway Modernization"
                  className="w-full text-sm rounded-lg border border-surface-border px-3 py-2 focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Version Identifier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleChangeField('version', e.target.value)}
                  placeholder="e.g. v2.4.0"
                  className="w-full text-sm font-mono rounded-lg border border-surface-border px-3 py-2 focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Release Owner / Team Contact</span>
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => handleChangeField('owner', e.target.value)}
                  placeholder="e.g. Alex Chen <alex.chen@company.internal>"
                  className="w-full text-sm rounded-lg border border-surface-border px-3 py-2 focus:ring-2 focus:ring-saffron-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Release Date</span>
                </label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => handleChangeField('releaseDate', e.target.value)}
                  className="w-full text-sm rounded-lg border border-surface-border px-3 py-2 focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Executive Overview Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChangeField('description', e.target.value)}
                placeholder="High-level background, release objectives, business rationale..."
                rows={3}
                className="w-full text-sm rounded-lg border border-surface-border px-3 py-2 focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Features */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-bold text-ink-primary">Completed Features</h3>
              <p className="text-xs text-ink-muted">List all new functional features completed and ready for release.</p>
            </div>
            <ItemListEditor
              items={formData.items}
              onChange={(updated) => handleChangeField('items', updated)}
              categoryFilter="feature"
              title="Features"
            />
          </div>
        )}

        {/* Tab 3: Bug Fixes */}
        {activeTab === 'bug_fixes' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-bold text-ink-primary">Bug Fixes</h3>
              <p className="text-xs text-ink-muted">List resolved bugs and defects addressed in this version.</p>
            </div>
            <ItemListEditor
              items={formData.items}
              onChange={(updated) => handleChangeField('items', updated)}
              categoryFilter="bug_fix"
              title="Bug Fixes"
            />
          </div>
        )}

        {/* Tab 4: Changed Behaviour */}
        {activeTab === 'behavior' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-bold text-ink-primary">Changed Behaviour & Breaking Changes</h3>
              <p className="text-xs text-ink-muted">Document any modified API payloads, UI changes, deprecations, or breaking changes.</p>
            </div>
            <ItemListEditor
              items={formData.items}
              onChange={(updated) => handleChangeField('items', updated)}
              categoryFilter="changed_behavior"
              title="Changed Behaviour"
            />
          </div>
        )}

        {/* Tab 5: QA & Evidence */}
        {activeTab === 'qa' && (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-base font-bold text-ink-primary">QA Methodology & Structured Evidence</h3>
              <p className="text-xs text-ink-muted">Supply overall test results and individual verifiable test evidence artifacts.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                QA Summary Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.qaSummary}
                onChange={(e) => handleChangeField('qaSummary', e.target.value)}
                placeholder="Summary of testing scope, regression results, performance metrics, and sign-off notes (min 15 characters)..."
                rows={3}
                className="w-full text-sm rounded-lg border border-surface-border px-3 py-2 focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                required
              />
            </div>

            <QAEvidenceEditor
              evidence={formData.evidence}
              onChange={(updated) => handleChangeField('evidence', updated)}
            />
          </div>
        )}

        {/* Tab 6: Known Limitations */}
        {activeTab === 'limitations' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-bold text-ink-primary">Known Limitations</h3>
              <p className="text-xs text-ink-muted">Disclose known edge-cases, temporary limits, or deferred fixes.</p>
            </div>
            <ItemListEditor
              items={formData.items}
              onChange={(updated) => handleChangeField('items', updated)}
              categoryFilter="known_limitation"
              title="Known Limitations"
            />
          </div>
        )}

        {/* Tab 7: Migration / Operations */}
        {activeTab === 'migrations' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-bold text-ink-primary">Migration & Configuration Notes</h3>
              <p className="text-xs text-ink-muted">List database migrations, environment variables, or config changes required before rollout.</p>
            </div>
            <ItemListEditor
              items={formData.items}
              onChange={(updated) => handleChangeField('items', updated)}
              categoryFilter="migration_note"
              title="Migration & Configuration Steps"
            />
          </div>
        )}

        {/* Tab 8: Affected Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-bold text-ink-primary">Affected User Groups</h3>
              <p className="text-xs text-ink-muted">Identify which user roles, tenants, or systems are impacted by this release.</p>
            </div>
            <ItemListEditor
              items={formData.items}
              onChange={(updated) => handleChangeField('items', updated)}
              categoryFilter="affected_user_group"
              title="Affected User Groups"
            />
          </div>
        )}
      </div>

      {/* Form Bottom Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-surface-border shadow-soft">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Items: <strong>{formData.items.length}</strong></span>
          <span>•</span>
          <span>QA Evidence: <strong>{formData.evidence.length}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Release Package'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
