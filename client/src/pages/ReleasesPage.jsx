import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, Search, Filter, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';

export function ReleasesPage() {
  const [releases, setReleases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReleases = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReleases();
      setReleases(res.releases || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch releases.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleDelete = async (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete release package "${name}"? This will delete all associated items, evidence, analyses, and version snapshots.`)) {
      return;
    }
    try {
      await api.deleteRelease(id);
      fetchReleases();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredReleases = releases.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.owner && r.owner.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-primary">Software Release Packages</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Manage release metadata, repeatable items, QA evidence, and review readiness.
          </p>
        </div>

        <Link
          to="/releases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-saffron-600 hover:bg-saffron-700 shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Release Package</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-surface-border shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by release name, version, or owner..."
            className="w-full text-xs rounded-lg border border-surface-border pl-9 pr-3 py-2 focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500"
          />
        </div>
      </div>

      {/* Release Cards List */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-xs text-ink-muted">
          Loading releases...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {error}
        </div>
      ) : filteredReleases.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-surface-border text-center space-y-3">
          <p className="text-sm font-semibold text-ink-primary">No matching release packages</p>
          <p className="text-xs text-ink-muted">Create a release package or adjust your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReleases.map(rel => (
            <div
              key={rel.id}
              className="bg-white rounded-xl border border-surface-border p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border">
                    {rel.version}
                  </span>
                  <button
                    onClick={(e) => handleDelete(rel.id, rel.name, e)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Delete release"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to={`/releases/${rel.id}`}
                  className="font-bold text-sm text-ink-primary hover:text-saffron-700 line-clamp-1 block"
                >
                  {rel.name}
                </Link>

                <p className="text-xs text-ink-muted line-clamp-2">
                  {rel.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-surface-border text-xs">
                <div className="flex items-center justify-between text-ink-muted text-[11px]">
                  <span>Owner: <strong>{rel.owner || 'Unassigned'}</strong></span>
                  <span>Target: {formatDate(rel.releaseDate)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">
                    {rel.itemCount} items • {rel.evidenceCount} QA records
                  </span>

                  <Link
                    to={`/releases/${rel.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-700 hover:text-saffron-800"
                  >
                    <span>Open Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
