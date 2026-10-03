import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  GitBranch, 
  FileText, 
  Server, 
  Key, 
  Terminal,
  HelpCircle
} from 'lucide-react';

export function TesterGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-surface-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-saffron-50/80 border-b border-saffron-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-saffron-500 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-primary">Tester & Reviewer Evaluation Guide</h3>
              <p className="text-xs text-saffron-800 font-medium">For evaluation & test verification purposes only</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-ink-primary hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-ink-primary">
          {/* Section 1: Test Credentials */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-ink-primary text-xs uppercase tracking-wider text-slate-700">
              <Key className="w-4 h-4 text-saffron-600" />
              <span>1. Test Login Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-semibold text-saffron-900">Lead Engineer (Default):</span>
                <p className="font-mono text-[11px] text-slate-600">Email: <strong className="text-ink-primary">demo@releaseready.ai</strong></p>
                <p className="font-mono text-[11px] text-slate-600">Password: <strong className="text-ink-primary">Password123!</strong></p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-semibold text-saffron-900">QA Lead / Reviewer:</span>
                <p className="font-mono text-[11px] text-slate-600">Email: <strong className="text-ink-primary">reviewer@releaseready.ai</strong></p>
                <p className="font-mono text-[11px] text-slate-600">Password: <strong className="text-ink-primary">Password123!</strong></p>
              </div>
            </div>
          </div>

          {/* Section 2: 1-Minute Quick Test Workflow */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
              <Sparkles className="w-4 h-4 text-saffron-600" />
              <span>2. Recommended 1-Minute Evaluation Flow</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-surface-border">
                <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>
                  <strong>Dashboard & Seeded Release:</strong> Open the seeded release package (<em>v2.4.0 — Enterprise SSO & Multi-Tenant Billing</em>).
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-surface-border">
                <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>
                  <strong>Overview Tab:</strong> Inspect the 7-section Deterministic Readiness Score Gauge (0-100%) and checklist.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-surface-border">
                <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>
                  <strong>AI Analysis Tab:</strong> Run Google Gemini evidence analysis to view the Change Impact Matrix, Evidence Explorer, and Dual Technical/Stakeholder Summaries.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-surface-border">
                <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <div>
                  <strong>Human Review Tab:</strong> Accept, inline-edit (preserving audit trail), or reject AI-generated statements.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-surface-border">
                <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold flex items-center justify-center shrink-0 text-[11px]">5</span>
                <div>
                  <strong>Version History Tab:</strong> Create immutable version snapshots and run side-by-side comparison diffs.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-surface-border">
                <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold flex items-center justify-center shrink-0 text-[11px]">6</span>
                <div>
                  <strong>Final Release Brief Tab:</strong> View the compiled 16-section release document with 1-click Markdown copy and Print/PDF layout.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Tech Stack & Architecture */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Server className="w-4 h-4 text-amber-700" />
              <span>3. Tech Stack & Cloud Hosting</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-amber-900">
              <li><strong>Frontend:</strong> React 18, Vite 6, Tailwind CSS (Hosted on Vercel)</li>
              <li><strong>Backend:</strong> Node.js, Express, Passport.js, SQLite WAL mode, Google Gemini 2.5 Flash (Hosted on Render)</li>
              <li><strong>Note:</strong> Free-tier Render web service may take ~10-15s to wake up on the first API request.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-surface-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-saffron-600 hover:bg-saffron-700 transition-colors cursor-pointer"
          >
            Got it, Continue Testing
          </button>
        </div>
      </div>
    </div>
  );
}
