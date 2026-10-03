import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFill = (role) => {
    setError(null);
    if (role === 'qa_lead') {
      setEmail('reviewer@releaseready.ai');
      setPassword('Password123!');
    } else {
      setEmail('demo@releaseready.ai');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-screen bg-saffron-hero-gradient flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-500 text-white font-bold text-2xl shadow-lg shadow-saffron-500/25 mb-4 ring-4 ring-white">
          RR
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
          ReleaseReady<span className="text-saffron-600">.AI</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-secondary">
          Evidence-Backed Release Readiness & Communication Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft rounded-2xl border border-surface-border space-y-6">
          {/* Quick Auto-Fill Demo Credentials Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-saffron-50/70 border border-saffron-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-saffron-900">
                <Sparkles className="w-4 h-4 text-saffron-600 shrink-0" />
                <span>Auto-Fill Test Credentials</span>
              </div>
              <span className="text-[10px] text-saffron-700 font-medium">Click to populate</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAutoFill('engineer')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-saffron-900 bg-white border border-saffron-200 hover:bg-saffron-100/60 hover:border-saffron-400 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5 text-saffron-600" />
                <span>Auto-fill Lead Engineer</span>
              </button>

              <button
                type="button"
                onClick={() => handleAutoFill('qa_lead')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-saffron-900 bg-white border border-saffron-200 hover:bg-saffron-100/60 hover:border-saffron-400 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-saffron-600" />
                <span>Auto-fill QA Lead</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-surface-border text-ink-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-surface-border text-ink-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 shadow-md shadow-saffron-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign in to ReleaseReady'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-surface-border text-center text-xs text-ink-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-saffron-700 hover:text-saffron-800 underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Note for Testing & Review Purpose Only */}
        <div className="mt-6 bg-white/90 backdrop-blur rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-3 text-xs text-ink-primary">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 border-b border-amber-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-saffron-600 shrink-0" />
            <span>📋 Note for Testing & Review Purposes Only</span>
          </div>

          <div className="space-y-2 text-ink-secondary text-[11.5px]">
            <p>
              <strong>Test Credentials:</strong> <span className="font-mono text-ink-primary bg-slate-100 px-1.5 py-0.5 rounded">demo@releaseready.ai</span> / <span className="font-mono text-ink-primary bg-slate-100 px-1.5 py-0.5 rounded">Password123!</span>
            </p>
            <p>
              <strong>Quick Test Path:</strong> Use the <em>Auto-Fill</em> buttons above, sign in, open the pre-seeded release (<em>v2.4.0</em>), check the 7-section readiness score, and run the Gemini AI analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
