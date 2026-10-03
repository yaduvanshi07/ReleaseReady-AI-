import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Settings, 
  Sparkles,
  GitBranch,
  CheckSquare,
  FileText,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/releases', label: 'Release Packages', icon: Package, end: true },
    { to: '/releases/new', label: 'Create Release', icon: PlusCircle, end: true },
    { to: '/settings', label: 'Settings & AI Engine', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-surface-border flex flex-col justify-between transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-surface-border bg-gradient-to-r from-saffron-50/50 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center text-white shadow-saffron-glow font-bold text-sm">
                RR
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-ink-primary">
                  ReleaseReady<span className="text-saffron-600">.AI</span>
                </span>
                <span className="block text-[10px] text-ink-muted uppercase font-medium tracking-wider">
                  Readiness Assistant
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-ink-muted hover:text-ink-primary lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-saffron-50 text-saffron-800 font-semibold border border-saffron-200/80 shadow-xs'
                        : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('w-4 h-4', isActive ? 'text-saffron-600' : 'text-ink-muted')} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Info Box */}
        <div className="p-4 m-3 rounded-xl bg-surface-subtle border border-surface-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary mb-1">
            <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
            <span>AI Evidence Rigor</span>
          </div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Deterministic validation and strict citation checks safeguard every release brief.
          </p>
        </div>
      </aside>
    </>
  );
}
