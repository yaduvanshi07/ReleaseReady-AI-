import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'engineer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: 'engineer', label: 'Engineering Lead / Developer' },
    { value: 'qa_lead', label: 'QA Lead / Test Engineer' },
    { value: 'product_manager', label: 'Product Manager / Owner' },
    { value: 'release_manager', label: 'Release Manager / Devops' }
  ];

  return (
    <div className="min-h-screen bg-saffron-hero-gradient flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-500 text-white font-bold text-2xl shadow-lg shadow-saffron-500/25 mb-4 ring-4 ring-white">
          RR
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
          Create Your Account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-secondary">
          Join ReleaseReady AI to create and audit evidence-backed release packages
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft rounded-2xl border border-surface-border space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-surface-border text-ink-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-surface-border text-ink-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Team Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="block w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-surface-border text-ink-primary bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 font-medium"
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min 6 characters"
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
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-surface-border text-center text-xs text-ink-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-saffron-700 hover:text-saffron-800 underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
