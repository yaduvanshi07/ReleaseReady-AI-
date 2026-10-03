import React, { useEffect, useState } from 'react';
import { Menu, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export function TopNav({ onOpenSidebar, title, actions }) {
  const [health, setHealth] = useState({ status: 'checking', aiConfigured: false });

  useEffect(() => {
    let isMounted = true;
    api.getHealth()
      .then(res => {
        if (isMounted) setHealth({ status: 'healthy', aiConfigured: res.aiConfigured });
      })
      .catch(() => {
        if (isMounted) setHealth({ status: 'error', aiConfigured: false });
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-surface-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-subtle lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-ink-primary tracking-tight">
          {title || 'ReleaseReady AI'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Gemini Engine Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-surface-subtle border border-surface-border">
          {health.status === 'healthy' ? (
            health.aiConfigured ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
                <span className="text-ink-secondary">Gemini Engine: <strong className="text-emerald-700">Online</strong></span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-ink-secondary">Gemini: <strong className="text-amber-700">Demo/Offline</strong></span>
              </>
            )
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span className="text-red-700">Backend Disconnected</span>
            </>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
