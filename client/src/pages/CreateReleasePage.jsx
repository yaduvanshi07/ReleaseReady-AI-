import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReleaseEditor } from '../features/releases/ReleaseEditor';
import { api } from '../lib/api';

export function CreateReleasePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.createRelease(formData);
      navigate(`/releases/${res.release.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create release package.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink-primary">Create New Software Release Package</h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Enter structured release details across the 7 required sections for deterministic validation and AI evidence analysis.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <ReleaseEditor onSave={handleSave} isSubmitting={isSubmitting} />
    </div>
  );
}
