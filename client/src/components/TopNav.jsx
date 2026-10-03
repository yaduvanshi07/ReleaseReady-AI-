import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sparkles, CheckCircle2, AlertCircle, LogOut, User, LogIn, HelpCircle, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { TesterGuideModal } from './TesterGuideModal';

export function TopNav({ onOpenSidebar, title, actions }) {
  const [health, setHealth] = useState({ status: 'checking', aiConfigured: false });
  const [showTesterGuide, setShowTesterGuide] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

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

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tester Guide Modal Button */}
        <button
          type="button"
          onClick={() => setShowTesterGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-all cursor-pointer shadow-2xs"
          title="Open Tester & Evaluation Guide"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-saffron-600" />
          <span className="hidden sm:inline">Tester Guide</span>
        </button>

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
                <span className="text-ink-secondary">Gemini: <strong className="text-amber-700">Demo Mode</strong></span>
              </>
            )
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span className="text-red-700">Backend Disconnected</span>
            </>
          )}
        </div>

        {/* User Profile / Auth State */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-saffron-500 to-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left leading-none">
                <p className="text-xs font-bold text-ink-primary truncate max-w-[120px]">{user.name}</p>
                <span className="text-[10px] text-ink-muted uppercase font-mono">{user.role || 'user'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-saffron-900 bg-saffron-50 hover:bg-saffron-100 border border-saffron-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-saffron-600" />
              <span>Sign In</span>
            </Link>
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Tester Guide Modal */}
      <TesterGuideModal
        isOpen={showTesterGuide}
        onClose={() => setShowTesterGuide(false)}
      />
    </header>
  );
}
