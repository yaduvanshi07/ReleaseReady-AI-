import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Database, Shield, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkHealth = () => {
    setIsLoading(true);
    api.getHealth()
      .then(res => setHealth(res))
      .catch(err => setHealth({ status: 'error', message: err.message }))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-ink-primary">Settings & System Health</h2>
        <p className="text-xs text-ink-muted mt-0.5">
          ReleaseReady AI environment configuration, Gemini AI engine status, and data persistence diagnostics.
        </p>
      </div>

      {/* AI Engine Status Card */}
      <div className="bg-white rounded-xl border border-surface-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-saffron-50 text-saffron-600 border border-saffron-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-primary">Google Gemini AI Engine</h3>
              <p className="text-xs text-ink-muted">Server-side LLM provider for release impact & evidence analysis.</p>
            </div>
          </div>

          <button
            onClick={checkHealth}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-slate-100"
            title="Refresh health status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border">
            <span className="font-semibold text-ink-primary">Gemini Provider Status:</span>
            {health?.aiConfigured ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>API Key Active (gemini-2.5-flash)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>No API Key Configured (Offline Demo Mode)</span>
              </span>
            )}
          </div>

          {!health?.aiConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg space-y-1 text-[11px]">
              <strong className="font-bold">How to configure Gemini API:</strong>
              <p>
                Add your Gemini API key to your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file in the server root:
              </p>
              <pre className="bg-white p-2 rounded border border-amber-200 font-mono text-[10px] text-slate-800">
                GEMINI_API_KEY=AIzaSy...&#10;GEMINI_MODEL=gemini-2.5-flash
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Database & Architecture Card */}
      <div className="bg-white rounded-xl border border-surface-border p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b pb-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-primary">Database & Storage</h3>
            <p className="text-xs text-ink-muted">Relational SQLite storage with WAL journaling and foreign keys enabled.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-surface-subtle rounded-lg border space-y-1">
            <span className="text-ink-muted text-[11px]">Database Driver</span>
            <p className="font-bold text-ink-primary font-mono">better-sqlite3 / WAL Mode</p>
          </div>
          <div className="p-3 bg-surface-subtle rounded-lg border space-y-1">
            <span className="text-ink-muted text-[11px]">Integrity Model</span>
            <p className="font-bold text-ink-primary">Cascading Foreign Keys & Transactions</p>
          </div>
        </div>
      </div>

      {/* Security & Safety Statement */}
      <div className="bg-white rounded-xl border border-surface-border p-6 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-ink-primary">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Safety & Human-in-the-Loop Safeguards</span>
        </div>
        <p className="text-ink-secondary leading-relaxed">
          ReleaseReady AI enforces strict advisory boundaries:
        </p>
        <ul className="list-disc list-inside space-y-1 text-ink-muted pl-1 text-[11px]">
          <li>The AI model never triggers software deployments or automatic release approvals.</li>
          <li>Every generated statement must be individually reviewed, edited, or accepted by a human release manager.</li>
          <li>Citation validator prevents hallucinated item codes by verifying every referenced code against the database.</li>
          <li>All API credentials remain secured on the server-side backend.</li>
        </ul>
      </div>
    </div>
  );
}
